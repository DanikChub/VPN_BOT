import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";

export interface HelloPayload {
    nodeId: number;
    token: string;
    agentVersion: string;
    nodeVersion: string;
    platform: string;
    architecture: string;
}

export type HelloMessage = ProtocolMessage<
    MessageType.HELLO,
    HelloPayload
>;

export interface HelloAckPayload {
    authenticated: boolean;
    serverTime: string;
    heartbeatIntervalMs: number;
}

export type HelloAckMessage = ProtocolMessage<
    MessageType.HELLO_ACK,
    HelloAckPayload
>;