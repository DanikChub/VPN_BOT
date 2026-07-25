import {
    MessageType,
    type CommandResultMessage,
} from "@vpn/common";

import type { CommandService } from "../services/command.service";
import type { NodeRegistry } from "../registry/node-registry";
import type { AgentMessageContext } from "../router/message-router";

interface CommandResultHandlerOptions {
    nodeRegistry: NodeRegistry;

    commandService: CommandService;
}

export class CommandResultHandler {
    private readonly nodeRegistry: NodeRegistry;

    private readonly commandService: CommandService;

    public constructor(
        options: CommandResultHandlerOptions,
    ) {
        this.nodeRegistry =
            options.nodeRegistry;

        this.commandService =
            options.commandService;
    }

    public handle = async (
        context: AgentMessageContext<CommandResultMessage>,
    ): Promise<void> => {
        const {
            socket,
            message,
        } = context;

        const agent =
            this.nodeRegistry.findBySocket(
                socket,
            );

        if (!agent) {
            socket.close(
                1008,
                "Authentication required",
            );

            return;
        }

        const completed =
            this.commandService.complete(
                message,
            );

        if (!completed) {
            console.warn(
                `Received unknown command result. requestId=${message.requestId}`,
            );
        }
    };
}