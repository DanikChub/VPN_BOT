import {
    type AddUsersCommandArguments,
    type AddUsersCommandResult,
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

export class AddUsersHandler {
    public constructor(
        private readonly xrayUserService:
        XrayUserService,

        private readonly appliedUsersStore:
        XrayAppliedUsersStore,
    ) {}

    public readonly handle = async (
        context: CommandHandlerContext,
    ): Promise<AddUsersCommandResult> => {
        const args =
            this.parseArguments(
                context.arguments,
            );

        const addedEmails: string[] = [];
        const existingEmails: string[] = [];

        for (const user of args.users) {
            const alreadyKnown =
                this.appliedUsersStore.hasUser(
                    args.inboundTag,
                    user.email,
                );

            await this.xrayUserService.addUser({
                inboundTag: args.inboundTag,
                uuid: user.uuid,
                email: user.email,

                ...(user.flow
                    ? {
                        flow: user.flow,
                    }
                    : {}),
            });

            this.appliedUsersStore.addUser(
                args.inboundTag,
                user,
            );

            if (alreadyKnown) {
                existingEmails.push(
                    user.email,
                );
            } else {
                addedEmails.push(
                    user.email,
                );
            }
        }

        return {
            inboundTag:
            args.inboundTag,

            addedEmails,

            existingEmails,

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
    ): AddUsersCommandArguments {
        if (
            typeof value !== "object" ||
            value === null
        ) {
            throw new Error(
                "ADD_USERS arguments must be an object",
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
                "ADD_USERS inboundTag is required",
            );
        }

        if (
            !Array.isArray(
                rawArguments.users,
            )
        ) {
            throw new Error(
                "ADD_USERS users must be an array",
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
                            `ADD_USERS user at index ${index} must be an object`,
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
                            `ADD_USERS uuid is required at index ${index}`,
                        );
                    }

                    if (
                        typeof user.email !==
                        "string" ||
                        !user.email.trim()
                    ) {
                        throw new Error(
                            `ADD_USERS email is required at index ${index}`,
                        );
                    }

                    if (
                        user.flow !== undefined &&
                        user.flow !== "xtls-rprx-vision"
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

                        ...(user.flow ===
                        "xtls-rprx-vision"
                            ? {
                                flow:
                                user.flow,
                            }
                            : {}),
                    };
                },
            );

        return {
            inboundTag:
                rawArguments.inboundTag.trim(),

            users,
        };
    }
}