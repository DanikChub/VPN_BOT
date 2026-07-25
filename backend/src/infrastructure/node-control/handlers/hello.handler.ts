import { WebSocket } from "ws";

import {
    MessageType,
    type HelloAckMessage,
    type HelloMessage,
} from "@vpn/common";

import type { NodeRegistry } from "../registry/node-registry";
import type { AgentMessageContext } from "../router/message-router";

interface HelloHandlerOptions {
    nodeRegistry: NodeRegistry;

    expectedToken: string;

    heartbeatIntervalMs?: number;

    markAuthenticated: (
        socket: WebSocket,
    ) => void;
}

export class HelloHandler {
    private readonly nodeRegistry:
        NodeRegistry;

    private readonly expectedToken:
        string;

    private readonly heartbeatIntervalMs:
        number;

    private readonly markAuthenticated: (
        socket: WebSocket,
    ) => void;

    public constructor(
        options: HelloHandlerOptions,
    ) {
        this.nodeRegistry =
            options.nodeRegistry;

        this.expectedToken =
            options.expectedToken;

        this.heartbeatIntervalMs =
            options.heartbeatIntervalMs ??
            10_000;

        this.markAuthenticated =
            options.markAuthenticated;
    }

    public handle = async (
        context: AgentMessageContext<HelloMessage>,
    ): Promise<void> => {
        const {
            socket,
            remoteAddress,
            message,
        } = context;

        if (
            !this.isValidHelloPayload(
                message.payload,
            )
        ) {
            this.sendError(
                socket,
                "INVALID_HELLO_PAYLOAD",
                "HELLO payload is invalid",
                message.requestId,
            );

            socket.close(
                1008,
                "Invalid HELLO payload",
            );

            return;
        }

        const existingAgent =
            this.nodeRegistry.findBySocket(
                socket,
            );

        if (existingAgent) {
            this.sendError(
                socket,
                "ALREADY_AUTHENTICATED",
                "This connection is already authenticated",
                message.requestId,
            );

            return;
        }

        if (
            message.payload.token !==
            this.expectedToken
        ) {
            console.warn(
                `Agent authentication failed: nodeId=${message.payload.nodeId}, address=${remoteAddress}`,
            );

            this.sendError(
                socket,
                "AUTHENTICATION_FAILED",
                "Invalid node token",
                message.requestId,
            );

            socket.close(
                1008,
                "Authentication failed",
            );

            return;
        }

        const agent =
            this.nodeRegistry.register({
                nodeId:
                message.payload.nodeId,

                socket,

                remoteAddress,

                agentVersion:
                message.payload.agentVersion,

                nodeVersion:
                message.payload.nodeVersion,

                platform:
                message.payload.platform,

                architecture:
                message.payload.architecture,
            });

        this.markAuthenticated(socket);

        console.log(
            [
                "Agent authenticated:",
                `nodeId=${agent.nodeId}`,
                `version=${agent.agentVersion}`,
                `platform=${agent.platform ?? "unknown"}`,
                `address=${agent.remoteAddress}`,
            ].join(" "),
        );

        const response: HelloAckMessage = {
            type:
            MessageType.HELLO_ACK,

            requestId:
            message.requestId,

            payload: {
                authenticated: true,

                serverTime:
                    new Date().toISOString(),

                heartbeatIntervalMs:
                this.heartbeatIntervalMs,
            },
        };

        const sent =
            this.sendMessage(
                socket,
                response,
            );

        if (!sent) {
            this.nodeRegistry.unregister(
                agent.nodeId,
                socket,
            );

            socket.close(
                1011,
                "Failed to send HELLO_ACK",
            );
        }
    };

    private isValidHelloPayload(
        payload: unknown,
    ): payload is HelloMessage["payload"] {
        if (
            typeof payload !==
            "object" ||
            payload === null ||
            Array.isArray(payload)
        ) {
            return false;
        }

        const value =
            payload as Record<
                string,
                unknown
            >;

        if (
            typeof value.nodeId !==
            "number" ||
            !Number.isInteger(
                value.nodeId,
            ) ||
            value.nodeId <= 0
        ) {
            return false;
        }

        if (
            typeof value.token !==
            "string" ||
            value.token.length === 0
        ) {
            return false;
        }

        if (
            typeof value.agentVersion !==
            "string" ||
            value.agentVersion.length === 0
        ) {
            return false;
        }

        if (
            value.nodeVersion !==
            undefined &&
            typeof value.nodeVersion !==
            "string"
        ) {
            return false;
        }

        if (
            value.platform !==
            undefined &&
            typeof value.platform !==
            "string"
        ) {
            return false;
        }

        if (
            value.architecture !==
            undefined &&
            typeof value.architecture !==
            "string"
        ) {
            return false;
        }

        return true;
    }

    private sendMessage(
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
                "Failed to send HELLO response:",
                error,
            );

            return false;
        }
    }

    private sendError(
        socket: WebSocket,
        code: string,
        message: string,
        requestId?: string,
    ): boolean {
        return this.sendMessage(
            socket,
            {
                type:
                MessageType.ERROR,

                requestId,

                payload: {
                    code,
                    message,
                },
            },
        );
    }
}