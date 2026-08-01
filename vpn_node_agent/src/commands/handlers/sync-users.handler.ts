import {
    type SyncUsersCommandArguments,
    type SyncUsersCommandResult,
    type XrayUser,
} from "@vpn/common";

import {
    type CommandHandlerContext,
} from "../command-router.js";

import {
    XrayUserService,
} from "../../xray/xray-user.service.js";

import {
    XrayAppliedUsersStore,
} from "../../xray/xray-applied-users.store.js";

export class SyncUsersHandler {
    public constructor(
        private readonly xrayUserService:
        XrayUserService,

        private readonly appliedUsersStore:
        XrayAppliedUsersStore,
    ) {}

    public readonly handle = async (
        context: CommandHandlerContext,
    ): Promise<SyncUsersCommandResult> => {
        const args =
            this.parseArguments(
                context.arguments,
            );

        const knownEmails =
            this.appliedUsersStore.getEmails(
                args.inboundTag,
            );

        console.log(knownEmails);

        const result =
            await this.xrayUserService.syncUsers({
                inboundTag:
                args.inboundTag,

                desiredUsers:
                args.users,

                knownEmails,

                mode:
                args.mode,
            });

        /*
         * Store заменяем только после полной
         * успешной синхронизации.
         */
        this.appliedUsersStore.replaceUsers(
            args.inboundTag,
            args.users,
        );

        return result;
    };

    private parseArguments(
        value: unknown,
    ): SyncUsersCommandArguments {
        if (
            typeof value !== "object" ||
            value === null
        ) {
            throw new Error(
                "SYNC_USERS arguments must be an object",
            );
        }

        const rawArguments =
            value as Record<
                string,
                unknown
            >;

        if (
            typeof rawArguments.inboundTag !==
            "string" ||
            !rawArguments.inboundTag.trim()
        ) {
            throw new Error(
                "SYNC_USERS inboundTag is required",
            );
        }

        if (
            rawArguments.mode !==
            "reconcile" &&
            rawArguments.mode !==
            "rebuild"
        ) {
            throw new Error(
                `Unsupported SYNC_USERS mode: ${String(rawArguments.mode)}`,
            );
        }

        if (
            !Array.isArray(
                rawArguments.users,
            )
        ) {
            throw new Error(
                "SYNC_USERS users must be an array",
            );
        }

        const emails =
            new Set<string>();

        const users =
            rawArguments.users.map(
                (
                    rawUser,
                    index,
                ): XrayUser => {
                    if (
                        typeof rawUser !== "object" ||
                        rawUser === null
                    ) {
                        throw new Error(
                            `SYNC_USERS user at index ${index} must be an object`,
                        );
                    }

                    const user =
                        rawUser as Record<
                            string,
                            unknown
                        >;

                    if (
                        typeof user.uuid !==
                        "string" ||
                        !user.uuid.trim()
                    ) {
                        throw new Error(
                            `SYNC_USERS uuid is required at index ${index}`,
                        );
                    }

                    if (
                        typeof user.email !==
                        "string" ||
                        !user.email.trim()
                    ) {
                        throw new Error(
                            `SYNC_USERS email is required at index ${index}`,
                        );
                    }

                    if (
                        user.flow !==
                        "xtls-rprx-vision"
                    ) {
                        throw new Error(
                            `Unsupported Xray flow at index ${index}`,
                        );
                    }

                    const email =
                        user.email.trim();

                    if (
                        emails.has(email)
                    ) {
                        throw new Error(
                            `Duplicate Xray user email: ${email}`,
                        );
                    }

                    emails.add(email);

                    return {
                        uuid:
                            user.uuid.trim(),

                        email,

                        flow:
                        user.flow,
                    };
                },
            );

        return {
            inboundTag:
                rawArguments.inboundTag.trim(),

            mode:
            rawArguments.mode,

            users,
        };
    }
}