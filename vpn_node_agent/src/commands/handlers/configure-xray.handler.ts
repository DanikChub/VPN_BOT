import type {
    ConfigureXrayCommandArguments,
    ConfigureXrayCommandResult,
} from "@vpn/common";

import type {
    CommandHandler,
    CommandHandlerContext,
} from "../command-router.js";

import type {
    XrayService,
} from "../../xray/xray.service.js";

interface ConfigureXrayHandlerOptions {
    xrayService:
        XrayService;
}

export class ConfigureXrayHandler {
    private readonly xrayService:
        XrayService;

    public constructor(
        options: ConfigureXrayHandlerOptions,
    ) {
        this.xrayService =
            options.xrayService;
    }

    public handle: CommandHandler =
        async (
            context: CommandHandlerContext,
        ): Promise<ConfigureXrayCommandResult> => {
            const arguments_ =
                this.parseArguments(
                    context.arguments,
                );

            return await this.xrayService.configure(
                arguments_,
            );
        };

    private parseArguments(
        value: unknown,
    ): ConfigureXrayCommandArguments {
        if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
        ) {
            throw new Error(
                "configure-xray arguments must be an object",
            );
        }

        const arguments_ =
            value as Record<
                string,
                unknown
            >;

        if (
            typeof arguments_.port !==
            "number" ||
            !Number.isInteger(
                arguments_.port,
            )
        ) {
            throw new Error(
                "configure-xray port must be an integer",
            );
        }

        if (
            typeof arguments_.inboundTag !==
            "string" ||
            arguments_.inboundTag.trim()
                .length === 0
        ) {
            throw new Error(
                "configure-xray inboundTag is required",
            );
        }

        if (
            typeof arguments_.serverName !==
            "string" ||
            arguments_.serverName.trim()
                .length === 0
        ) {
            throw new Error(
                "configure-xray serverName is required",
            );
        }

        return {
            port:
            arguments_.port,

            inboundTag:
                arguments_.inboundTag
                    .trim(),

            serverName:
                arguments_.serverName
                    .trim()
                    .toLowerCase(),
        };
    }
}