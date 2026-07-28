import { WebSocket } from "ws";

import { MessageType } from "@vpn/common";


import vpnNodeService from "../../../modules/vpn-nodes/vpn-node.service";
import {NodeRegistry} from "../connection/node-registry";
import {AgentMessageContext} from "../transport/message-router";
import {AgentMessageSender} from "../transport/message-sender";

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
    messageSender: AgentMessageSender;
}

export class HeartbeatHandler {
    private readonly nodeRegistry: NodeRegistry;
    private readonly messageSender: AgentMessageSender;

    public constructor(
        options: HeartbeatHandlerOptions,
    ) {
        this.nodeRegistry =
            options.nodeRegistry;

        this.messageSender =
            options.messageSender;
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
            this.messageSender.sendError(
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
            this.messageSender.sendError(
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
            this.messageSender.send(
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


}