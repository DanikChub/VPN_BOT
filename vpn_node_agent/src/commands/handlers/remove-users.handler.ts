import {
    type RemoveUsersCommandArguments,
    type RemoveUsersCommandResult,
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

export class RemoveUsersHandler {
    public constructor(
        private readonly xrayUserService:
        XrayUserService,

        private readonly appliedUsersStore:
        XrayAppliedUsersStore,
    ) {}

    public readonly handle = async (
        context: CommandHandlerContext,
    ): Promise<RemoveUsersCommandResult> => {
        const args =
            this.parseArguments(
                context.arguments,
            );

        const removedEmails: string[] = [];
        const missingEmails: string[] = [];

        for (const email of args.emails) {
            const wasKnown =
                this.appliedUsersStore.hasUser(
                    args.inboundTag,
                    email,
                );

            await this.xrayUserService.removeUser({
                inboundTag:
                args.inboundTag,

                email,
            });

            this.appliedUsersStore.removeUser(
                args.inboundTag,
                email,
            );

            if (wasKnown) {
                removedEmails.push(
                    email,
                );
            } else {
                missingEmails.push(
                    email,
                );
            }
        }

        return {
            inboundTag:
            args.inboundTag,

            removedEmails,

            missingEmails,

            totalUsers:
            this.appliedUsersStore
                .getUsers(
                    args.inboundTag,
                )
                .length,
        };
    };

    private parseArguments(
        value: unknown,
    ): RemoveUsersCommandArguments {
        if (
            typeof value !== "object" ||
            value === null
        ) {
            throw new Error(
                "REMOVE_USERS arguments must be an object",
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
                "REMOVE_USERS inboundTag is required",
            );
        }

        if (
            !Array.isArray(
                rawArguments.emails,
            )
        ) {
            throw new Error(
                "REMOVE_USERS emails must be an array",
            );
        }

        const uniqueEmails =
            new Set<string>();

        for (
            let index = 0;
            index <
            rawArguments.emails.length;
            index++
        ) {
            const rawEmail =
                rawArguments.emails[index];

            if (
                typeof rawEmail !== "string" ||
                !rawEmail.trim()
            ) {
                throw new Error(
                    `REMOVE_USERS email at index ${index} is invalid`,
                );
            }

            uniqueEmails.add(
                rawEmail.trim(),
            );
        }

        return {
            inboundTag:
                rawArguments.inboundTag.trim(),

            emails:
                Array.from(
                    uniqueEmails,
                ),
        };
    }
}