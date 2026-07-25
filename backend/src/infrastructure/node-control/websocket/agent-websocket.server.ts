import type {
    IncomingMessage,
    Server as HttpServer,
} from "node:http";

import {
    WebSocket,
    WebSocketServer,
    type RawData,
} from "ws";

import type { NodeRegistry } from "../registry/node-registry";

import {
    MessageRouter,
    type IncomingProtocolMessage,
} from "../router/message-router";

interface AgentWebSocketServerOptions {
    httpServer: HttpServer;

    nodeRegistry: NodeRegistry;

    path?: string;

    maxPayloadBytes?: number;

    authenticationTimeoutMs?: number;
}

interface HandleRawMessageInput {
    socket: WebSocket;

    request: IncomingMessage;

    remoteAddress: string;

    data: RawData;

    isBinary: boolean;
}

export class AgentWebSocketServer {
    private readonly webSocketServer:
        WebSocketServer;

    private readonly nodeRegistry:
        NodeRegistry;

    private readonly messageRouter:
        MessageRouter;

    private readonly path: string;

    private readonly authenticationTimeoutMs:
        number;

    private readonly authenticationTimers =
        new Map<WebSocket, NodeJS.Timeout>();

    private isClosing = false;

    public constructor(
        options: AgentWebSocketServerOptions,
    ) {
        this.nodeRegistry =
            options.nodeRegistry;

        this.path =
            options.path ??
            "/ws/agent";

        this.authenticationTimeoutMs =
            options.authenticationTimeoutMs ??
            10_000;

        this.messageRouter =
            new MessageRouter(
                (
                    socket,
                    error,
                ) => {
                    this.sendError(
                        socket,
                        error.code,
                        error.message,
                        error.requestId,
                    );
                },
            );

        this.webSocketServer =
            new WebSocketServer({
                server:
                options.httpServer,

                path:
                this.path,

                maxPayload:
                    options.maxPayloadBytes ??
                    1024 * 1024,
            });

        this.registerServerEvents();

        console.log(
            `Agent WebSocket server initialized on ${this.path}`,
        );
    }

    public getRouter(): MessageRouter {
        return this.messageRouter;
    }

    private registerServerEvents(): void {
        this.webSocketServer.on(
            "connection",
            (
                socket,
                request,
            ) => {
                this.handleConnection(
                    socket,
                    request,
                );
            },
        );

        this.webSocketServer.on(
            "error",
            (error) => {
                console.error(
                    "Agent WebSocket server error:",
                    error,
                );
            },
        );

        this.webSocketServer.on(
            "close",
            () => {
                console.log(
                    "Agent WebSocket server closed",
                );
            },
        );
    }

    private handleConnection(
        socket: WebSocket,
        request: IncomingMessage,
    ): void {
        if (this.isClosing) {
            socket.close(
                1012,
                "Backend is shutting down",
            );

            return;
        }

        const remoteAddress =
            this.getRemoteAddress(
                request,
            );

        console.log(
            `Agent connected from ${remoteAddress}`,
        );

        this.startAuthenticationTimer(
            socket,
            remoteAddress,
        );

        socket.on(
            "message",
            (
                data,
                isBinary,
            ) => {
                void this.handleRawMessage({
                    socket,
                    request,
                    remoteAddress,
                    data,
                    isBinary,
                });
            },
        );

        socket.on(
            "close",
            (
                code,
                reasonBuffer,
            ) => {
                this.handleSocketClose(
                    socket,
                    remoteAddress,
                    code,
                    reasonBuffer,
                );
            },
        );

        socket.on(
            "error",
            (error) => {
                console.error(
                    `Agent socket error: address=${remoteAddress}`,
                    error,
                );
            },
        );
    }

    private async handleRawMessage(
        input: HandleRawMessageInput,
    ): Promise<void> {
        const {
            socket,
            request,
            remoteAddress,
            data,
            isBinary,
        } = input;

        if (
            socket.readyState !==
            WebSocket.OPEN
        ) {
            return;
        }

        if (isBinary) {
            this.sendError(
                socket,
                "BINARY_MESSAGES_NOT_SUPPORTED",
                "Binary WebSocket messages are not supported",
            );

            return;
        }

        const rawMessage =
            data.toString("utf8");

        let parsedValue: unknown;

        try {
            parsedValue =
                JSON.parse(rawMessage);
        } catch {
            this.sendError(
                socket,
                "INVALID_JSON",
                "Message must contain valid JSON",
            );

            return;
        }

        if (
            !this.isProtocolMessage(
                parsedValue,
            )
        ) {
            this.sendError(
                socket,
                "INVALID_MESSAGE",
                "Message must contain valid type and payload fields",
            );

            return;
        }

        await this.messageRouter.handle({
            socket,
            request,
            remoteAddress,
            message:
            parsedValue,
        });
    }

    private handleSocketClose(
        socket: WebSocket,
        remoteAddress: string,
        code: number,
        reasonBuffer: Buffer,
    ): void {
        this.clearAuthenticationTimer(
            socket,
        );

        const reason =
            reasonBuffer.toString() ||
            "no reason";

        const disconnectedAgent =
            this.nodeRegistry.unregisterBySocket(
                socket,
            );

        if (disconnectedAgent) {
            console.log(
                `Agent disconnected: nodeId=${disconnectedAgent.nodeId}, address=${remoteAddress}, code=${code}, reason=${reason}`,
            );

            return;
        }

        console.log(
            `Unauthenticated agent disconnected: address=${remoteAddress}, code=${code}, reason=${reason}`,
        );
    }

    private startAuthenticationTimer(
        socket: WebSocket,
        remoteAddress: string,
    ): void {
        const timer =
            setTimeout(
                () => {
                    const agent =
                        this.nodeRegistry.findBySocket(
                            socket,
                        );

                    if (agent) {
                        return;
                    }

                    console.warn(
                        `Agent authentication timeout: address=${remoteAddress}`,
                    );

                    this.sendError(
                        socket,
                        "AUTHENTICATION_TIMEOUT",
                        "Agent did not authenticate in time",
                    );

                    socket.close(
                        1008,
                        "Authentication timeout",
                    );
                },
                this.authenticationTimeoutMs,
            );

        timer.unref();

        this.authenticationTimers.set(
            socket,
            timer,
        );
    }

    public markAuthenticated(
        socket: WebSocket,
    ): void {
        this.clearAuthenticationTimer(
            socket,
        );
    }

    private clearAuthenticationTimer(
        socket: WebSocket,
    ): void {
        const timer =
            this.authenticationTimers.get(
                socket,
            );

        if (!timer) {
            return;
        }

        clearTimeout(timer);

        this.authenticationTimers.delete(
            socket,
        );
    }

    private getRemoteAddress(
        request: IncomingMessage,
    ): string {
        const forwardedFor =
            request.headers[
                "x-forwarded-for"
                ];

        if (
            typeof forwardedFor ===
            "string"
        ) {
            return (
                forwardedFor
                    .split(",")[0]
                    ?.trim() ||
                "unknown"
            );
        }

        if (
            Array.isArray(
                forwardedFor,
            )
        ) {
            return (
                forwardedFor[0] ??
                "unknown"
            );
        }

        return (
            request.socket
                .remoteAddress ??
            "unknown"
        );
    }

    private isProtocolMessage(
        value: unknown,
    ): value is IncomingProtocolMessage {
        if (
            typeof value !==
            "object" ||
            value === null ||
            Array.isArray(value)
        ) {
            return false;
        }

        const message =
            value as Record<
                string,
                unknown
            >;

        if (
            typeof message.type !==
            "string" ||
            message.type.trim()
                .length === 0
        ) {
            return false;
        }

        if (
            !Object.prototype.hasOwnProperty.call(
                message,
                "payload",
            )
        ) {
            return false;
        }

        if (
            message.requestId !==
            undefined &&
            typeof message.requestId !==
            "string"
        ) {
            return false;
        }

        return true;
    }

    public send(
        socket: WebSocket,
        message: unknown,
    ): boolean {
        if (
            socket.readyState !==
            WebSocket.OPEN
        ) {
            return false;
        }

        try {
            socket.send(
                JSON.stringify(
                    message,
                ),
            );

            return true;
        } catch (error) {
            console.error(
                "Failed to send WebSocket message:",
                error,
            );

            return false;
        }
    }

    public sendError(
        socket: WebSocket,
        code: string,
        message: string,
        requestId?: string,
    ): boolean {
        return this.send(
            socket,
            {
                type: "error",

                requestId,

                payload: {
                    code,
                    message,
                },
            },
        );
    }

    public async close(): Promise<void> {
        if (this.isClosing) {
            return;
        }

        this.isClosing = true;

        for (
            const timer of
            this.authenticationTimers.values()
            ) {
            clearTimeout(timer);
        }

        this.authenticationTimers.clear();

        this.nodeRegistry.closeAll(
            1001,
            "Backend shutting down",
        );

        for (
            const socket of
            this.webSocketServer.clients
            ) {
            if (
                socket.readyState ===
                WebSocket.OPEN ||
                socket.readyState ===
                WebSocket.CONNECTING
            ) {
                socket.close(
                    1001,
                    "Backend shutting down",
                );
            }
        }

        await new Promise<void>(
            (
                resolve,
                reject,
            ) => {
                this.webSocketServer.close(
                    (error) => {
                        if (error) {
                            reject(error);

                            return;
                        }

                        resolve();
                    },
                );
            },
        );
    }
}