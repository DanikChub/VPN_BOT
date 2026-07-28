import {
    MessageType,
    type CommandResultMessage,
} from "@vpn/common";
import {NodeRegistry} from "../connection/node-registry";
import {CommandService} from "../rpc/command.service";
import {AgentMessageContext} from "../transport/message-router";



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