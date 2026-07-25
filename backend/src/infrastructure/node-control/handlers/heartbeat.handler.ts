import { WebSocket } from "ws";

import { MessageType } from "@vpn/common";

import type { NodeRegistry } from "../registry/node-registry";
import type { AgentMessageContext } from "../router/message-router";
import vpnNodeService from "../../../modules/vpn-nodes/vpn-node.service";

interface HeartbeatPayload {
    timestamp?: string;
    uptimeSeconds?: number;
}

interface HeartbeatMessage {
    type: MessageType.HEARTBEAT;
    requestId?: string;
    payload: HeartbeatPayload;
}

interface HeartbeatAckMessage {
    type: MessageType.HEARTBEAT_ACK;
    requestId?: string;
    payload: {
        nodeId: number;
        serverTime: string;
    };
}

interface HeartbeatHandlerOptions {
    nodeRegistry: NodeRegistry;
}

export class HeartbeatHandler {
    private readonly nodeRegistry: NodeRegistry;

    public constructor(
        options: HeartbeatHandlerOptions,
    ) {
        this.nodeRegistry =
            options.nodeRegistry;
    }

    public handle = async (
        context: AgentMessageContext<HeartbeatMessage>,
    ): Promise<void> => {
        const {
            socket,
            message,
            remoteAddress,
        } = context;

        const agent =
            this.nodeRegistry.findBySocket(
                socket,
            );

        if (!agent) {
            this.sendError(
                socket,
                "NOT_AUTHENTICATED",
                "Agent must authenticate before sending heartbeat",
                message.requestId,
            );

            socket.close(
                1008,
                "Authentication required",
            );

            return;
        }

        if (
            !this.isValidHeartbeatPayload(
                message.payload,
            )
        ) {
            this.sendError(
                socket,
                "INVALID_HEARTBEAT_PAYLOAD",
                "Heartbeat payload is invalid",
                message.requestId,
            );

            return;
        }

        const now = new Date();

        await vpnNodeService.updateHeartbeat(
            agent.nodeId,
            message.payload,
        );

        const response: HeartbeatAckMessage = {
            type:
            MessageType.HEARTBEAT_ACK,

            requestId:
            message.requestId,

            payload: {
                nodeId:
                agent.nodeId,

                serverTime:
                    now.toISOString(),
            },
        };

        const sent =
            this.sendMessage(
                socket,
                response,
            );

        if (!sent) {
            console.warn(
                [
                    "Failed to send heartbeat acknowledgement:",
                    `nodeId=${agent.nodeId}`,
                    `address=${remoteAddress}`,
                ].join(" "),
            );
        }
    };

    private isValidHeartbeatPayload(
        payload: unknown,
    ): payload is HeartbeatPayload {
        if (
            typeof payload !== "object" ||
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
            value.timestamp !== undefined &&
            (
                typeof value.timestamp !==
                "string" ||
                Number.isNaN(
                    Date.parse(
                        value.timestamp,
                    ),
                )
            )
        ) {
            return false;
        }

        if (
            value.uptimeSeconds !==
            undefined &&
            (
                typeof value.uptimeSeconds !==
                "number" ||
                !Number.isFinite(
                    value.uptimeSeconds,
                ) ||
                value.uptimeSeconds < 0
            )
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
                "Failed to send heartbeat response:",
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