import {
    execFile,
} from "node:child_process";

import {
    randomBytes,
} from "node:crypto";

import {
    chmod,
    mkdir,
    readFile,
    rename,
    rm,
    writeFile,
} from "node:fs/promises";

import {
    dirname,
} from "node:path";

import {
    promisify,
} from "node:util";

import type {
    AddUsersCommandArguments,
    AddUsersCommandResult,
    ConfigureXrayCommandArguments,
    ConfigureXrayCommandResult,
    RemoveUsersCommandArguments,
    RemoveUsersCommandResult,
    XrayUser,
} from "@vpn/common";

const execFileAsync =
    promisify(execFile);

interface XrayServiceOptions {
    binaryPath?: string;

    configPath?: string;

    serviceName?: string;

    apiAddress?: string;
}

interface RealityKeyPair {
    privateKey: string;

    publicKey: string;
}

export class XrayService {
    private readonly binaryPath:
        string;

    private readonly configPath:
        string;

    private readonly serviceName:
        string;

    private readonly apiAddress:
        string;

    public constructor(
        options: XrayServiceOptions = {},
    ) {
        this.binaryPath =
            options.binaryPath ??
            "/usr/local/bin/xray";

        this.configPath =
            options.configPath ??
            "/usr/local/etc/xray/config.json";

        this.serviceName =
            options.serviceName ??
            "xray";

        this.apiAddress =
            options.apiAddress ??
            "127.0.0.1:10085";
    }

    public async configure(
        input: ConfigureXrayCommandArguments,
    ): Promise<ConfigureXrayCommandResult> {
        this.validateConfigureInput(
            input,
        );

        await this.assertInstalled();

        const keyPair =
            await this.generateRealityKeyPair();

        const shortId =
            randomBytes(8)
                .toString("hex");

        const config =
            this.createConfig({
                port:
                input.port,

                inboundTag:
                input.inboundTag,

                serverName:
                input.serverName,

                privateKey:
                keyPair.privateKey,

                shortId,
            });

        await this.applyConfig(
            config,
        );

        return {
            port:
            input.port,

            inboundTag:
            input.inboundTag,

            serverName:
            input.serverName,

            realityPublicKey:
            keyPair.publicKey,

            realityShortId:
            shortId,

            apiAddress:
            this.apiAddress,

            configPath:
            this.configPath,
        };
    }

    public async addUsers(
        input: AddUsersCommandArguments,
    ): Promise<AddUsersCommandResult> {
        this.validateInboundTag(
            input.inboundTag,
        );

        if (
            !Array.isArray(input.users) ||
            input.users.length === 0
        ) {
            throw new Error(
                "At least one Xray user is required",
            );
        }

        const users =
            input.users.map(
                (user) =>
                    this.validateXrayUser(
                        user,
                    ),
            );

        const config =
            await this.readConfig();

        const inbound =
            this.findInbound(
                config,
                input.inboundTag,
            );

        const clients =
            this.getInboundClients(
                inbound,
            );

        const addedEmails: string[] = [];
        const existingEmails: string[] = [];

        for (const user of users) {
            const existingByEmail =
                clients.find(
                    (client) =>
                        client.email ===
                        user.email,
                );

            if (existingByEmail) {
                /*
                 * Одинаковый email и одинаковый UUID —
                 * команда уже была применена.
                 */
                if (
                    existingByEmail.id ===
                    user.uuid
                ) {
                    existingEmails.push(
                        user.email,
                    );

                    continue;
                }

                throw new Error(
                    `Xray user "${user.email}" already exists with a different UUID`,
                );
            }

            const existingByUuid =
                clients.find(
                    (client) =>
                        client.id ===
                        user.uuid,
                );

            if (existingByUuid) {
                throw new Error(
                    `Xray UUID "${user.uuid}" is already assigned to "${existingByUuid.email}"`,
                );
            }

            clients.push({
                id:
                user.uuid,

                email:
                user.email,

                flow:
                user.flow,
            });

            addedEmails.push(
                user.email,
            );
        }

        const settings =
            inbound.settings as Record<
                string,
                unknown
            >;

        settings.clients =
            clients;

        /*
         * Если все пользователи уже были добавлены,
         * не перезапускаем Xray впустую.
         */
        if (addedEmails.length > 0) {
            await this.applyConfig(
                config,
            );
        }

        return {
            inboundTag:
            input.inboundTag,

            addedEmails,

            existingEmails,

            totalUsers:
            clients.length,
        };
    }

    public async removeUsers(
        input: RemoveUsersCommandArguments,
    ): Promise<RemoveUsersCommandResult> {
        this.validateInboundTag(
            input.inboundTag,
        );

        if (
            !Array.isArray(input.emails) ||
            input.emails.length === 0
        ) {
            throw new Error(
                "At least one Xray user email is required",
            );
        }

        const requestedEmails =
            [
                ...new Set(
                    input.emails.map(
                        (email) =>
                            this.normalizeEmail(
                                email,
                            ),
                    ),
                ),
            ];

        const config =
            await this.readConfig();

        const inbound =
            this.findInbound(
                config,
                input.inboundTag,
            );

        const clients =
            this.getInboundClients(
                inbound,
            );

        const existingEmails =
            new Set(
                clients.map(
                    (client) =>
                        client.email,
                ),
            );

        const removedEmails =
            requestedEmails.filter(
                (email) =>
                    existingEmails.has(
                        email,
                    ),
            );

        const missingEmails =
            requestedEmails.filter(
                (email) =>
                    !existingEmails.has(
                        email,
                    ),
            );

        if (removedEmails.length > 0) {
            const emailsToRemove =
                new Set(
                    removedEmails,
                );

            const remainingClients =
                clients.filter(
                    (client) =>
                        !emailsToRemove.has(
                            client.email,
                        ),
                );

            const settings =
                inbound.settings as Record<
                    string,
                    unknown
                >;

            settings.clients =
                remainingClients;

            await this.applyConfig(
                config,
            );

            return {
                inboundTag:
                input.inboundTag,

                removedEmails,

                missingEmails,

                totalUsers:
                remainingClients.length,
            };
        }

        return {
            inboundTag:
            input.inboundTag,

            removedEmails,

            missingEmails,

            totalUsers:
            clients.length,
        };
    }

    private async readConfig():
        Promise<Record<string, unknown>> {
        let rawConfig: string;

        try {
            rawConfig =
                await readFile(
                    this.configPath,
                    "utf8",
                );
        } catch (error) {
            throw new Error(
                `Unable to read Xray config at ${this.configPath}: ${this.getErrorMessage(error)}`,
            );
        }

        let parsed:
            unknown;

        try {
            parsed =
                JSON.parse(
                    rawConfig,
                );
        } catch (error) {
            throw new Error(
                `Xray config contains invalid JSON: ${this.getErrorMessage(error)}`,
            );
        }

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
        ) {
            throw new Error(
                "Xray config root must be an object",
            );
        }

        return parsed as Record<
            string,
            unknown
        >;
    }

    private findInbound(
        config: Record<string, unknown>,
        inboundTag: string,
    ): Record<string, unknown> {
        if (
            !Array.isArray(
                config.inbounds,
            )
        ) {
            throw new Error(
                "Xray config does not contain an inbounds array",
            );
        }

        const inbound =
            config.inbounds.find(
                (value) => {
                    if (
                        typeof value !==
                        "object" ||
                        value === null ||
                        Array.isArray(value)
                    ) {
                        return false;
                    }

                    return (
                        (
                            value as Record<
                                string,
                                unknown
                            >
                        ).tag ===
                        inboundTag
                    );
                },
            );

        if (
            typeof inbound !== "object" ||
            inbound === null ||
            Array.isArray(inbound)
        ) {
            throw new Error(
                `Xray inbound "${inboundTag}" was not found`,
            );
        }

        return inbound as Record<
            string,
            unknown
        >;
    }

    private getInboundClients(
        inbound: Record<string, unknown>,
    ): Array<{
        id: string;

        email: string;

        flow: "xtls-rprx-vision";
    }> {
        if (
            typeof inbound.settings !==
            "object" ||
            inbound.settings === null ||
            Array.isArray(
                inbound.settings,
            )
        ) {
            throw new Error(
                "Xray inbound settings must be an object",
            );
        }

        const settings =
            inbound.settings as Record<
                string,
                unknown
            >;

        if (
            !Array.isArray(
                settings.clients,
            )
        ) {
            throw new Error(
                "Xray inbound clients must be an array",
            );
        }

        return settings.clients.map(
            (
                client,
                index,
            ) => {
                if (
                    typeof client !==
                    "object" ||
                    client === null ||
                    Array.isArray(client)
                ) {
                    throw new Error(
                        `Invalid Xray client at index ${index}`,
                    );
                }

                const value =
                    client as Record<
                        string,
                        unknown
                    >;

                if (
                    typeof value.id !==
                    "string" ||
                    typeof value.email !==
                    "string"
                ) {
                    throw new Error(
                        `Invalid Xray client at index ${index}`,
                    );
                }

                return {
                    id:
                    value.id,

                    email:
                    value.email,

                    flow:
                        "xtls-rprx-vision",
                };
            },
        );
    }

    private validateXrayUser(
        value: XrayUser,
    ): XrayUser {
        if (
            typeof value !== "object" ||
            value === null
        ) {
            throw new Error(
                "Invalid Xray user",
            );
        }

        if (
            typeof value.uuid !==
            "string" ||
            !this.isValidUuid(
                value.uuid,
            )
        ) {
            throw new Error(
                `Invalid Xray user UUID: ${String(value.uuid)}`,
            );
        }

        const email =
            this.normalizeEmail(
                value.email,
            );

        if (
            value.flow !==
            "xtls-rprx-vision"
        ) {
            throw new Error(
                `Unsupported Xray user flow: ${String(value.flow)}`,
            );
        }

        return {
            uuid:
                value.uuid.toLowerCase(),

            email,

            flow:
                "xtls-rprx-vision",
        };
    }

    private validateInboundTag(
        inboundTag: string,
    ): void {
        if (
            typeof inboundTag !==
            "string" ||
            inboundTag.trim()
                .length === 0
        ) {
            throw new Error(
                "Xray inboundTag is required",
            );
        }
    }

    private normalizeEmail(
        value: unknown,
    ): string {
        if (
            typeof value !==
            "string"
        ) {
            throw new Error(
                "Xray user email must be a string",
            );
        }

        const email =
            value.trim();

        if (
            email.length === 0 ||
            email.length > 255
        ) {
            throw new Error(
                "Xray user email must contain between 1 and 255 characters",
            );
        }

        /*
         * Это не обязательно настоящий email.
         * У нас значение вроде user_123.
         */
        if (
            !/^[a-zA-Z0-9._:@+-]+$/.test(
                email,
            )
        ) {
            throw new Error(
                `Invalid Xray user email: ${email}`,
            );
        }

        return email;
    }

    private isValidUuid(
        value: string,
    ): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value,
        );
    }

    public async restart():
        Promise<void> {
        try {
            await execFileAsync(
                "/usr/bin/systemctl",
                [
                    "restart",
                    this.serviceName,
                ],
                {
                    timeout:
                        30_000,

                    maxBuffer:
                        1024 * 1024,
                },
            );
        } catch (error) {
            throw new Error(
                `Failed to restart Xray: ${this.getErrorMessage(error)}`,
            );
        }

        await this.assertActive();
    }

    public async assertActive():
        Promise<void> {
        try {
            const result =
                await execFileAsync(
                    "/usr/bin/systemctl",
                    [
                        "is-active",
                        this.serviceName,
                    ],
                    {
                        timeout:
                            10_000,
                    },
                );

            const status =
                result.stdout.trim();

            if (status !== "active") {
                throw new Error(
                    `Unexpected Xray status: ${status}`,
                );
            }
        } catch (error) {
            throw new Error(
                `Xray service is not active: ${this.getErrorMessage(error)}`,
            );
        }
    }

    private validateConfigureInput(
        input: ConfigureXrayCommandArguments,
    ): void {
        if (
            !Number.isInteger(
                input.port,
            ) ||
            input.port < 1 ||
            input.port > 65_535
        ) {
            throw new Error(
                "Xray port must be an integer between 1 and 65535",
            );
        }

        if (
            typeof input.inboundTag !==
            "string" ||
            input.inboundTag.trim()
                .length === 0
        ) {
            throw new Error(
                "Xray inboundTag is required",
            );
        }

        if (
            !this.isValidHostname(
                input.serverName,
            )
        ) {
            throw new Error(
                `Invalid Reality serverName: ${input.serverName}`,
            );
        }
    }

    private isValidHostname(
        value: string,
    ): boolean {
        if (
            typeof value !== "string" ||
            value.length < 1 ||
            value.length > 253
        ) {
            return false;
        }

        return /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(
            value,
        );
    }

    private async assertInstalled():
        Promise<void> {
        try {
            await execFileAsync(
                this.binaryPath,
                [
                    "version",
                ],
                {
                    timeout:
                        10_000,
                },
            );
        } catch (error) {
            throw new Error(
                `Xray binary is unavailable at ${this.binaryPath}: ${this.getErrorMessage(error)}`,
            );
        }
    }

    private async generateRealityKeyPair():
        Promise<RealityKeyPair> {
        let stdout: string;

        try {
            const result =
                await execFileAsync(
                    this.binaryPath,
                    [
                        "x25519",
                    ],
                    {
                        timeout:
                            10_000,

                        maxBuffer:
                            1024 * 1024,
                    },
                );

            stdout =
                result.stdout;
        } catch (error) {
            throw new Error(
                `Failed to generate Reality keys: ${this.getErrorMessage(error)}`,
            );
        }

        const privateKey =
            this.findOutputValue(
                stdout,
                [
                    "Private key",
                    "PrivateKey",
                ],
            );

        const publicKey =
            this.findOutputValue(
                stdout,
                [
                    "Password (PublicKey)",
                    "Password",
                    "Public key",
                    "PublicKey",
                ],
            );

        if (
            !privateKey ||
            !publicKey
        ) {
            throw new Error(
                `Unable to parse Xray x25519 output: ${stdout.trim()}`,
            );
        }

        return {
            privateKey,
            publicKey,
        };
    }

    private findOutputValue(
        output: string,
        labels: string[],
    ): string | null {
        const lines =
            output
                .split(/\r?\n/)
                .map(
                    (line) =>
                        line.trim(),
                )
                .filter(Boolean);

        for (const line of lines) {
            for (const label of labels) {
                const escapedLabel =
                    label.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&",
                    );

                const match =
                    line.match(
                        new RegExp(
                            `^${escapedLabel}\\s*:\\s*(.+)$`,
                            "i",
                        ),
                    );

                const value =
                    match?.[1]
                        ?.trim();

                if (value) {
                    return value;
                }
            }
        }

        return null;
    }

    private createConfig(
        input: {
            port: number;

            inboundTag: string;

            serverName: string;

            privateKey: string;

            shortId: string;
        },
    ): Record<string, unknown> {
        return {
            log: {
                loglevel:
                    "warning",
            },

            api: {
                tag:
                    "api",

                listen:
                this.apiAddress,

                services: [
                    "HandlerService",
                    "StatsService",
                ],
            },

            stats: {},

            policy: {
                levels: {
                    "0": {
                        statsUserUplink:
                            true,

                        statsUserDownlink:
                            true,
                    },
                },

                system: {
                    statsInboundUplink:
                        true,

                    statsInboundDownlink:
                        true,

                    statsOutboundUplink:
                        true,

                    statsOutboundDownlink:
                        true,
                },
            },

            inbounds: [
                {
                    tag:
                    input.inboundTag,

                    listen:
                        "0.0.0.0",

                    port:
                    input.port,

                    protocol:
                        "vless",

                    settings: {
                        clients: [],

                        decryption:
                            "none",
                    },

                    streamSettings: {
                        network:
                            "raw",

                        security:
                            "reality",

                        realitySettings: {
                            show:
                                false,

                            target:
                                `${input.serverName}:443`,

                            xver:
                                0,

                            serverNames: [
                                input.serverName,
                            ],

                            privateKey:
                            input.privateKey,

                            shortIds: [
                                input.shortId,
                            ],
                        },
                    },

                    sniffing: {
                        enabled:
                            true,

                        destOverride: [
                            "http",
                            "tls",
                            "quic",
                        ],
                    },
                },
            ],

            outbounds: [
                {
                    tag:
                        "direct",

                    protocol:
                        "freedom",
                },

                {
                    tag:
                        "blocked",

                    protocol:
                        "blackhole",
                },
            ],
        };
    }

    private async applyConfig(
        config: Record<string, unknown>,
    ): Promise<void> {
        const directory =
            dirname(
                this.configPath,
            );

        const temporaryPath =
            `${this.configPath}.tmp.json`;

        const backupPath =
            `${this.configPath}.backup`;

        const serialized =
            `${JSON.stringify(
                config,
                null,
                2,
            )}\n`;

        await mkdir(
            directory,
            {
                recursive:
                    true,
            },
        );

        let previousConfig:
            string | null = null;

        try {
            previousConfig =
                await readFile(
                    this.configPath,
                    "utf8",
                );
        } catch (error) {
            const fsError =
                error as NodeJS.ErrnoException;

            if (fsError.code !== "ENOENT") {
                throw error;
            }
        }

        try {
            await writeFile(
                temporaryPath,
                serialized,
                {
                    encoding:
                        "utf8",

                    mode:
                        0o600,
                },
            );

            await this.testConfig(
                temporaryPath,
            );

            if (previousConfig !== null) {
                await writeFile(
                    backupPath,
                    previousConfig,
                    {
                        encoding:
                            "utf8",

                        mode:
                            0o600,
                    },
                );
            }

            await rename(
                temporaryPath,
                this.configPath,
            );

            /*
             * Агент работает от root, а Xray может запускаться
             * от отдельного системного пользователя.
             *
             * Приватный ключ Reality находится внутри конфига,
             * но для MVP разрешаем системным пользователям чтение,
             * иначе Xray не сможет запуститься.
             */
            await chmod(
                this.configPath,
                0o644,
            );

            await this.restart();

            await rm(
                backupPath,
                {
                    force:
                        true,
                },
            );
        } catch (error) {
            await rm(
                temporaryPath,
                {
                    force:
                        true,
                },
            );

            if (previousConfig !== null) {
                try {
                    await writeFile(
                        this.configPath,
                        previousConfig,
                        {
                            encoding:
                                "utf8",

                            mode:
                                0o644,
                        },
                    );

                    await this.restart();
                } catch (rollbackError) {
                    throw new Error(
                        [
                            `Failed to apply Xray config: ${this.getErrorMessage(error)}.`,
                            `Rollback failed: ${this.getErrorMessage(rollbackError)}`,
                        ].join(" "),
                    );
                }
            }

            throw new Error(
                `Failed to apply Xray config: ${this.getErrorMessage(error)}`,
            );
        }
    }

    private async testConfig(
        configPath: string,
    ): Promise<void> {
        try {
            await execFileAsync(
                this.binaryPath,
                [
                    "run",
                    "-test",
                    "-config",
                    configPath,
                ],
                {
                    timeout:
                        15_000,

                    maxBuffer:
                        1024 * 1024,
                },
            );
        } catch (error) {
            throw new Error(
                `Xray config validation failed: ${this.getErrorMessage(error)}`,
            );
        }
    }

    private getErrorMessage(
        error: unknown,
    ): string {
        if (!(error instanceof Error)) {
            return String(
                error,
            );
        }

        const processError =
            error as Error & {
                stdout?: string;

                stderr?: string;
            };

        return (
            processError.stderr
                ?.trim() ||
            processError.stdout
                ?.trim() ||
            error.message
        );
    }
}