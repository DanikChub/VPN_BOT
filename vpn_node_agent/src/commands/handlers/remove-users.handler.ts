import type {
    RemoveUsersCommandArguments,
    RemoveUsersCommandResult,
} from "@vpn/common";

import type {
    CommandHandler,
    CommandHandlerContext,
} from "../command-router.js";

import type {XrayUserService} from "../../xray/xray-user.service.js";



interface RemoveUsersHandlerOptions {

    xrayUserService:
        XrayUserService;

}
export class RemoveUsersHandler {
    private readonly xrayUserService:
        XrayUserService;

    public constructor(
        options: RemoveUsersHandlerOptions,
    ) {
        this.xrayUserService =
            options.xrayUserService;
    }

    public handle: CommandHandler =
        async (
            context: CommandHandlerContext,
        ): Promise<RemoveUsersCommandResult> => {
            const arguments_ =
                this.parseArguments(
                    context.arguments,
                );

            throw new Error(
                "remove users via Xray API is not implemented yet",
            );
        };

    private parseArguments(
        value: unknown,
    ): RemoveUsersCommandArguments {
        if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
        ) {
            throw new Error(
                "remove-users arguments must be an object",
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
                "remove-users inboundTag is required",
            );
        }

        if (
            !Array.isArray(
                arguments_.emails,
            ) ||
            arguments_.emails.length === 0
        ) {
            throw new Error(
                "remove-users emails must be a non-empty array",
            );
        }

        const emails =
            arguments_.emails.map(
                (
                    email,
                    index,
                ) => {
                    if (
                        typeof email !==
                        "string" ||
                        email.trim()
                            .length === 0
                    ) {
                        throw new Error(
                            `remove-users emails[${index}] must be a non-empty string`,
                        );
                    }

                    return email.trim();
                },
            );

        return {
            inboundTag:
                arguments_.inboundTag
                    .trim(),

            emails,
        };
    }
}