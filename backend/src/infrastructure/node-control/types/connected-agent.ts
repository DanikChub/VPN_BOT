import type { WebSocket } from "ws";

export interface ConnectedAgent {
    nodeId: number;
    socket: WebSocket;

    remoteAddress: string;

    connectedAt: Date;
    lastSeenAt: Date;

    agentVersion: string;
    nodeVersion?: string;

    platform?: string;
    architecture?: string;
}

export interface RegisterAgentInput {
    nodeId: number;
    socket: WebSocket;

    remoteAddress: string;

    agentVersion: string;
    nodeVersion?: string;

    platform?: string;
    architecture?: string;
}

export interface ConnectedAgentInfo {
    nodeId: number;

    remoteAddress: string;

    connectedAt: Date;
    lastSeenAt: Date;

    agentVersion: string;
    nodeVersion?: string;

    platform?: string;
    architecture?: string;

    isConnected: boolean;
}