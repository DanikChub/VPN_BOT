import type {
    IncomingMessage,
} from "node:http";

import type {
    WebSocket,
} from "ws";

export interface IncomingProtocolMessage {
    type: string;
    requestId?: string;
    payload: unknown;
}

export interface AgentMessageContext<
    TMessage = IncomingProtocolMessage,
> {
    socket: WebSocket;

    request: IncomingMessage;

    remoteAddress: string;

    message: TMessage;
}

export type AgentMessageHandler<
    TMessage = IncomingProtocolMessage,
> = (
    context: AgentMessageContext<TMessage>,
) => void | Promise<void>;

export interface MessageRouterError {
    code:
        | "UNSUPPORTED_MESSAGE"
        | "MESSAGE_HANDLER_ERROR";

    message: string;

    requestId?: string;

    cause?: unknown;
}

export type MessageRouterErrorHandler = (
    socket: WebSocket,
    error: MessageRouterError,
) => void;

export class MessageRouter {
    private readonly handlers =
        new Map<
            string,
            AgentMessageHandler<unknown>
        >();

    private readonly errorHandler:
        MessageRouterErrorHandler;

    public constructor(
        errorHandler:
        MessageRouterErrorHandler,
    ) {
        this.errorHandler =
            errorHandler;
    }

    public register<TMessage>(
        messageType: string,
        handler:
        AgentMessageHandler<TMessage>,
    ): void {
        if (
            this.handlers.has(
                messageType,
            )
        ) {
            throw new Error(
                `Handler for message type "${messageType}" is already registered`,
            );
        }

        this.handlers.set(
            messageType,
            handler as AgentMessageHandler<unknown>,
        );
    }

    public unregister(
        messageType: string,
    ): boolean {
        return this.handlers.delete(
            messageType,
        );
    }

    public hasHandler(
        messageType: string,
    ): boolean {
        return this.handlers.has(
            messageType,
        );
    }

    public getRegisteredMessageTypes():
        string[] {
        return Array.from(
            this.handlers.keys(),
        );
    }

    public async handle(
        context:
        AgentMessageContext,
    ): Promise<void> {
        const {
            socket,
            message,
        } = context;

        const handler =
            this.handlers.get(
                message.type,
            );

        if (!handler) {
            this.errorHandler(
                socket,
                {
                    code:
                        "UNSUPPORTED_MESSAGE",

                    message:
                        `Unsupported message type: ${message.type}`,

                    requestId:
                    message.requestId,
                },
            );

            return;
        }

        try {
            await handler(
                context as AgentMessageContext<unknown>,
            );
        } catch (error) {
            console.error(
                `Failed to process agent message: type=${message.type}, address=${context.remoteAddress}`,
                error,
            );

            this.errorHandler(
                socket,
                {
                    code:
                        "MESSAGE_HANDLER_ERROR",

                    message:
                        "Failed to process message",

                    requestId:
                    message.requestId,

                    cause:
                    error,
                },
            );
        }
    }
}