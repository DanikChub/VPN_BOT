import {
    execFile,
} from "node:child_process";

import {
    randomBytes,
} from "node:crypto";

import {
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
    ConfigureXrayInput,
    ConfigureXrayResult,
    XrayRealityKeyPair,
    XrayServerConfig,
} from "./xray.types.js";

const execFileAsync =
    promisify(execFile);

interface XrayConfigServiceOptions {
    binaryPath?: string;

    configPath?: string;

    serviceName?: string;

    apiAddress?: string;
}

export class XrayConfigService {
    private readonly binaryPath:
        string;

    private readonly configPath:
        string;

    private readonly serviceName:
        string;

    private readonly apiAddress:
        string;

    public constructor(
        options: XrayConfigServiceOptions = {},
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
        input: ConfigureXrayInput,
    ): Promise<ConfigureXrayResult> {
        this.validateInput(
            input,
        );

        await this.assertXrayInstalled();

        const keyPair =
            await this.generateRealityKeyPair();

        const shortId =
            this.generateShortId();

        const config =
            this.createConfig(
                input,
                keyPair.privateKey,
                shortId,
            );

        await this.writeAndApplyConfig(
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

    private validateInput(
        input: ConfigureXrayInput,
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
                "Xray inbound tag is required",
            );
        }

        if (
            !this.isValidHostname(
                input.serverName,
            )
        ) {
            throw new Error(
                `Invalid Reality server name: ${input.serverName}`,
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

        const hostnamePattern =
            /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

        return hostnamePattern.test(
            value,
        );
    }

    private async assertXrayInstalled():
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
                `Xray binary is not available at ${this.binaryPath}: ${this.getErrorMessage(error)}`,
            );
        }
    }

    private async generateRealityKeyPair():
        Promise<XrayRealityKeyPair> {
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
            this.extractOutputValue(
                stdout,
                [
                    "PrivateKey",
                    "Private key",
                    "Private key:",
                ],
            );

        /*
         * В новых версиях Xray публичная часть
         * может называться Password.
         *
         * Поддерживаем также старые варианты
         * PublicKey и Public key.
         */
        const publicKey =
            this.extractOutputValue(
                stdout,
                [
                    "Password",
                    "Password (PublicKey)",
                    "PublicKey",
                    "Public key",
                ],
            );

        if (
            !privateKey ||
            !publicKey
        ) {
            throw new Error(
                [
                    "Failed to parse Xray x25519 output.",
                    `Output: ${stdout.trim()}`,
                ].join(" "),
            );
        }

        return {
            privateKey,
            publicKey,
        };
    }

    private extractOutputValue(
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
                const normalizedLabel =
                    label.replace(
                        /:$/,
                        "",
                    );

                const pattern =
                    new RegExp(
                        `^${this.escapeRegExp(normalizedLabel)}\\s*:\\s*(.+)$`,
                        "i",
                    );

                const match =
                    line.match(
                        pattern,
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

    private escapeRegExp(
        value: string,
    ): string {
        return value.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );
    }

    private generateShortId(): string {
        /*
         * 8 байт = 16 hex-символов.
         */
        return randomBytes(8)
            .toString("hex");
    }

    private createConfig(
        input: ConfigureXrayInput,
        privateKey: string,
        shortId: string,
    ): XrayServerConfig {
        return {
            log: {
                loglevel:
                    "warning",
            },

            /*
             * Упрощённый API-режим:
             * Xray самостоятельно поднимает API listener.
             */
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
                        method:
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

                            privateKey,

                            shortIds: [
                                shortId,
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

            routing: {
                domainStrategy:
                    "AsIs",

                rules: [],
            },
        };
    }

    private async writeAndApplyConfig(
        config: XrayServerConfig,
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
            const nodeError =
                error as NodeJS.ErrnoException;

            if (
                nodeError.code !==
                "ENOENT"
            ) {
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

            await this.restartXray();

            await this.assertXrayActive();

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
                                0o600,
                        },
                    );

                    await this.restartXray();
                } catch (rollbackError) {
                    throw new Error(
                        [
                            `Failed to configure Xray: ${this.getErrorMessage(error)}.`,
                            `Rollback also failed: ${this.getErrorMessage(rollbackError)}`,
                        ].join(" "),
                    );
                }
            }

            throw new Error(
                `Failed to configure Xray: ${this.getErrorMessage(error)}`,
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
                `Xray configuration validation failed: ${this.getErrorMessage(error)}`,
            );
        }
    }

    private async restartXray():
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
                `Failed to restart Xray service: ${this.getErrorMessage(error)}`,
            );
        }
    }

    private async assertXrayActive():
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

            if (
                result.stdout.trim() !==
                "active"
            ) {
                throw new Error(
                    `Unexpected service status: ${result.stdout.trim()}`,
                );
            }
        } catch (error) {
            throw new Error(
                `Xray service is not active: ${this.getErrorMessage(error)}`,
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

        const stderr =
            processError.stderr
                ?.trim();

        const stdout =
            processError.stdout
                ?.trim();

        return (
            stderr ||
            stdout ||
            error.message
        );
    }
}