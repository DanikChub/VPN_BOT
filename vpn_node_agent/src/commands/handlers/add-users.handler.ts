import type {
    AddUsersCommandArguments,
    AddUsersCommandResult,
    XrayUser,
} from "@vpn/common";

import type {
    CommandHandler,
    CommandHandlerContext,
} from "../command-router.js";
import type {XrayUserService} from "../../xray/xray-user.service.js";

interface AddUsersHandlerOptions {
    xrayUserService: XrayUserService;
}


export class AddUsersHandler {
    private readonly xrayUserService: XrayUserService;

    public constructor(
        options: AddUsersHandlerOptions,
    ) {
        this.xrayUserService =
            options.xrayUserService;
    }

    public handle: CommandHandler =
        async (
            context: CommandHandlerContext,
        ): Promise<AddUsersCommandResult> => {
            const arguments_ =
                this.parseArguments(
                    context.arguments,
                );

            for(
                const user of arguments_.users
                ){

                await this.xrayUserService.addUser({
                    inboundTag:
                    arguments_.inboundTag,

                    uuid:
                    user.uuid,

                    email:
                    user.email,

                    flow:
                    user.flow,
                });
            }


            return {
                inboundTag:
                arguments_.inboundTag,

                addedEmails:
                    arguments_.users.map(
                        user => user.email,
                    ),

                existingEmails:[],

                totalUsers:
                arguments_.users.length,
            };
        };

    private parseArguments(
        value: unknown,
    ): AddUsersCommandArguments {
        if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
        ) {
            throw new Error(
                "add-users arguments must be an object",
            );
        }

        const arguments_ =
            value as Record<
                string,
                unknown
            >;

        if (
            typeof arguments_.inboundTag !==
            "string" ||
            arguments_.inboundTag.trim()
                .length === 0
        ) {
            throw new Error(
                "add-users inboundTag is required",
            );
        }

        if (
            !Array.isArray(
                arguments_.users,
            ) ||
            arguments_.users.length === 0
        ) {
            throw new Error(
                "add-users users must be a non-empty array",
            );
        }

        const users =
            arguments_.users.map(
                (
                    value_,
                    index,
                ): XrayUser => {
                    if (
                        typeof value_ !==
                        "object" ||
                        value_ === null ||
                        Array.isArray(value_)
                    ) {
                        throw new Error(
                            `add-users users[${index}] must be an object`,
                        );
                    }

                    const user =
                        value_ as Record<
                            string,
                            unknown
                        >;

                    if (
                        typeof user.uuid !==
                        "string"
                    ) {
                        throw new Error(
                            `add-users users[${index}].uuid is required`,
                        );
                    }

                    if (
                        typeof user.email !==
                        "string"
                    ) {
                        throw new Error(
                            `add-users users[${index}].email is required`,
                        );
                    }

                    if (
                        user.flow !==
                        "xtls-rprx-vision"
                    ) {
                        throw new Error(
                            `add-users users[${index}].flow must be xtls-rprx-vision`,
                        );
                    }

                    return {
                        uuid:
                        user.uuid,

                        email:
                        user.email,

                        flow:
                            "xtls-rprx-vision",
                    };
                },
            );

        return {
            inboundTag:
                arguments_.inboundTag
                    .trim(),

            users,
        };
    }
}