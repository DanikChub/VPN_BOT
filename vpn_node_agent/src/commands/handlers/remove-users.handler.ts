import type {
    RemoveUsersCommandArguments,
    RemoveUsersCommandResult,
} from "@vpn/common";

import type {
    CommandHandler,
    CommandHandlerContext,
} from "../command-router.js";

import type {
    XrayService,
} from "../../xray/xray.service.js";

interface RemoveUsersHandlerOptions {
    xrayService:
        XrayService;
}

export class RemoveUsersHandler {
    private readonly xrayService:
        XrayService;

    public constructor(
        options: RemoveUsersHandlerOptions,
    ) {
        this.xrayService =
            options.xrayService;
    }

    public handle: CommandHandler =
        async (
            context: CommandHandlerContext,
        ): Promise<RemoveUsersCommandResult> => {
            const arguments_ =
                this.parseArguments(
                    context.arguments,
                );

            return await this.xrayService.removeUsers(
                arguments_,
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