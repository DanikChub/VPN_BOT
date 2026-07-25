import {
    MessageType,
    AgentCommandType,
    type CommandMessage,
} from "@vpn/common";

import {
    logger,
} from "../logger/logger.js";


export interface CommandHandlerContext {
    requestId?: string;

    command:
        AgentCommandType;

    arguments:
        unknown;
}


export type CommandHandler =
    (
        context: CommandHandlerContext,
    ) => Promise<unknown>;



export class CommandRouter {

    private readonly handlers =
        new Map<
            AgentCommandType,
            CommandHandler
        >();



    public register(
        command: AgentCommandType,
        handler: CommandHandler,
    ): void {

        if (
            this.handlers.has(command)
        ) {
            throw new Error(
                `Command handler already registered: ${command}`,
            );
        }


        this.handlers.set(
            command,
            handler,
        );
    }



    public async handle(
        message: unknown,
    ): Promise<unknown | null> {


        if (
            !this.isCommandMessage(
                message,
            )
        ) {
            return null;
        }


        const handler =
            this.handlers.get(
                message.payload.command,
            );


        if (!handler) {

            logger.warn(
                "No command handler found",
                {
                    command:
                    message.payload.command,
                },
            );


            return {
                success: false,

                error:
                    `Unknown command: ${message.payload.command}`,
            };
        }



        try {

            const context: CommandHandlerContext = {
                command:
                message.payload.command,

                arguments:
                message.payload.arguments,
            };


            if (message.requestId) {
                context.requestId =
                    message.requestId;
            }


            const result =
                await handler(
                    context,
                );



            return {
                success: true,

                data: result,
            };


        } catch(error) {


            logger.error(
                "Command execution failed",
                {
                    command:
                    message.payload.command,

                    error:
                        error instanceof Error
                            ? error.message
                            : String(error),
                },
            );


            return {
                success: false,

                error: {
                    code: "COMMAND_EXECUTION_FAILED",

                    message:
                        error instanceof Error
                            ? error.message
                            : String(error),
                },
            };
        }
    }




    private isCommandMessage(
        value: unknown,
    ): value is CommandMessage {


        if (
            typeof value !== "object" ||
            value === null
        ) {
            return false;
        }


        const message =
            value as Record<string, unknown>;



        if (
            message.type !==
            MessageType.COMMAND
        ) {
            return false;
        }



        if (
            typeof message.payload !==
            "object" ||
            message.payload === null
        ) {
            return false;
        }



        const payload =
            message.payload as Record<
                string,
                unknown
            >;



        if (
            typeof payload.command !==
            "string"
        ) {
            return false;
        }



        return Object.values(
            AgentCommandType,
        ).includes(
            payload.command as AgentCommandType,
        );
    }
}