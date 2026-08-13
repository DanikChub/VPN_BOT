import WebSocket, { type RawData } from "ws";

import {
    MessageType,
    type HelloMessage,
    type MessageType as ProtocolMessageType,
    type ProtocolMessage,
    type CommandResultMessage,
    type CommandResultPayload,
} from "@vpn/common";
import type {CommandRouter} from "../commands/command-router.js";


interface AgentConnectionLogger {
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
}

interface AgentConnectionOptions {
    url: string;
    nodeId: number;
    token: string;
    agentVersion: string;
    logger: AgentConnectionLogger;
}

export class AgentConnection {
    private socket: WebSocket | undefined;
    private isConnected = false;

    private readonly url: string;
    private readonly logger: AgentConnectionLogger;

    private readonly nodeId: number;
    private readonly token: string;
    private readonly agentVersion: string;

    private commandRouter?: CommandRouter;

    public constructor(options: AgentConnectionOptions) {
        this.url = options.url;
        this.logger = options.logger;
        this.nodeId = options.nodeId;
        this.token = options.token;
        this.agentVersion = options.agentVersion;
    }

    public setCommandRouter(
        router: CommandRouter,
    ): void {
        this.commandRouter = router;
    }

    public async connect(): Promise<void> {
        if (
            this.socket?.readyState === WebSocket.OPEN ||
            this.socket?.readyState === WebSocket.CONNECTING
        ) {
            this.logger.debug(
                "WebSocket connection already exists",
            );

            return;
        }

        this.logger.info(
            "Connecting to control server",
            {
                url: this.url,
            },
        );

        await new Promise<void>((resolve, reject) => {
            const socket = new WebSocket(this.url);

            this.socket = socket;

            let connectionSettled = false;

            const handleInitialError = (error: Error): void => {
                if (connectionSettled) {
                    return;
                }

                connectionSettled = true;
                reject(error);
            };

            socket.once("open", () => {
                connectionSettled = true;
                this.isConnected = true;

                this.logger.info(
                    "Connected to control server",
                    {
                        url: this.url,
                    },
                );

                this.sendHello();

                resolve();
            });

            socket.on("message", (data: RawData) => {
                this.handleMessage(data);
            });

            socket.on("close", (code, reasonBuffer) => {
                this.isConnected = false;

                if (this.socket === socket) {
                    this.socket = undefined;
                }

                const reason = reasonBuffer.toString();

                this.logger.warn(
                    "Disconnected from control server",
                    {
                        code,
                        reason: reason || undefined,
                    },
                );

                if (!connectionSettled) {
                    connectionSettled = true;

                    reject(
                        new Error(
                            `WebSocket closed before connection was established. Code: ${code}`,
                        ),
                    );
                }
            });

            socket.on("error", (error: Error) => {
                this.logger.error(
                    "WebSocket connection error",
                    {
                        message: error.message,
                        stack: error.stack,
                    },
                );

                handleInitialError(error);
            });
        });
    }

    public send<
        TType extends ProtocolMessageType,
        TPayload,
    >(
        message: ProtocolMessage<TType, TPayload>,
    ): void {
        const socket = this.socket;

        if (
            !this.isConnected ||
            socket?.readyState !== WebSocket.OPEN
        ) {
            throw new Error(
                "Cannot send message: WebSocket is not connected",
            );
        }

        const serializedMessage = JSON.stringify(message);

        socket.send(serializedMessage, (error?: Error) => {
            if (error) {
                this.logger.error(
                    "Failed to send WebSocket message",
                    {
                        type: message.type,
                        requestId: message.requestId,
                        message: error.message,
                    },
                );

                return;
            }

            this.logger.debug(
                "WebSocket message sent",
                {
                    type: message.type,
                    requestId: message.requestId,
                },
            );
        });
    }

    public async disconnect(): Promise<void> {
        const socket = this.socket;

        if (!socket) {
            this.isConnected = false;
            return;
        }

        if (socket.readyState === WebSocket.CLOSED) {
            this.socket = undefined;
            this.isConnected = false;
            return;
        }

        this.logger.info(
            "Disconnecting from control server",
        );

        await new Promise<void>((resolve) => {
            const forceCloseTimeout = setTimeout(() => {
                this.logger.warn(
                    "WebSocket did not close in time, terminating connection",
                );

                socket.terminate();
                resolve();
            }, 5_000);

            forceCloseTimeout.unref();

            socket.once("close", () => {
                clearTimeout(forceCloseTimeout);
                resolve();
            });

            socket.close(
                1000,
                "Agent shutting down",
            );
        });

        if (this.socket === socket) {
            this.socket = undefined;
        }

        this.isConnected = false;

        this.logger.info(
            "Control server connection closed",
        );
    }

    public get connected(): boolean {
        return (
            this.isConnected &&
            this.socket?.readyState === WebSocket.OPEN
        );
    }

    private async handleMessage(
        data: RawData,
    ): Promise<void> {

        const rawMessage =
            data.toString();


        try {

            const message =
                JSON.parse(rawMessage);



            this.logger.debug(
                "WebSocket message received",
                {
                    type:
                    message.type,
                },
            );



            switch(message.type) {


                case MessageType.COMMAND:

                    await this.handleCommand(
                        message,
                    );

                    break;



                case MessageType.HELLO_ACK:

                    this.logger.info(
                        "Backend accepted agent connection",
                    );

                    break;



                case MessageType.HEARTBEAT_ACK:

                    this.logger.debug(
                        "Heartbeat acknowledged",
                    );

                    break;



                default:

                    this.logger.warn(
                        "Unknown message received",
                        {
                            type:
                            message.type,
                        },
                    );
            }


        } catch(error) {

            this.logger.error(
                "Failed to process websocket message",
                {
                    error:
                        error instanceof Error
                            ? error.message
                            : String(error),
                },
            );
        }
    }

    private async handleCommand(
        message: unknown,
    ): Promise<void> {
        const commandMessage =
            message as {
                requestId?: string;
                payload?: {
                    command?: string;
                    arguments?: unknown;
                };
            };

        this.logger.info(
            "Command received",
            {
                requestId:
                commandMessage.requestId,
                command:
                commandMessage.payload?.command,
                arguments:
                commandMessage.payload?.arguments,
            },
        );

        if (!this.commandRouter) {
            this.logger.error(
                "Command router is not configured",
            );

            return;
        }

        const result =
            await this.commandRouter.handle(
                message,
            );

        this.logger.info(
            "Command execution completed",
            {
                requestId:
                commandMessage.requestId,
                command:
                commandMessage.payload?.command,
                result,
            },
        );

        const requestId =
            commandMessage.requestId;

        const payload: CommandResultPayload =
            result !== null &&
            typeof result === "object" &&
            "success" in result
                ? result as CommandResultPayload
                : {
                    success: false,
                    error: {
                        code:
                            "COMMAND_ERROR",

                        message:
                            "Invalid command result",
                    },
                };

        const response: CommandResultMessage = {
            type:
            MessageType.COMMAND_RESULT,
            payload,
        };

        if (requestId) {
            response.requestId =
                requestId;
        }

        this.send(response);
    }

    private sendHello(): void {
        const message: HelloMessage = {
            type: MessageType.HELLO,
            payload: {
                nodeId: this.nodeId,
                token: this.token,
                agentVersion: this.agentVersion,
                nodeVersion: process.version,
                platform: process.platform,
                architecture: process.arch,
            },
        };

        this.send(message);
    }
}