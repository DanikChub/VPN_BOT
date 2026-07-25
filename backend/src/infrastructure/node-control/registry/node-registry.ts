import { WebSocket } from "ws";

import type {
    ConnectedAgent,
    ConnectedAgentInfo,
    RegisterAgentInput,
} from "../types/connected-agent";

export class NodeRegistry {
    private readonly agents = new Map<
        number,
        ConnectedAgent
    >();

    public register(
        input: RegisterAgentInput,
    ): ConnectedAgent {
        const existingAgent =
            this.agents.get(input.nodeId);

        if (
            existingAgent &&
            existingAgent.socket !== input.socket
        ) {
            try {
                existingAgent.socket.close(
                    4001,
                    "Replaced by a new connection",
                );
            } catch (error) {
                console.error(
                    `Failed to close previous connection for node ${input.nodeId}:`,
                    error,
                );
            }
        }

        const now = new Date();

        const agent: ConnectedAgent = {
            nodeId: input.nodeId,
            socket: input.socket,

            remoteAddress: input.remoteAddress,

            connectedAt: now,
            lastSeenAt: now,

            agentVersion: input.agentVersion,
            nodeVersion: input.nodeVersion,

            platform: input.platform,
            architecture: input.architecture,
        };

        this.agents.set(
            input.nodeId,
            agent,
        );

        console.log(
            `Node registered: nodeId=${input.nodeId}, online=${this.agents.size}`,
        );

        return agent;
    }

    public unregister(
        nodeId: number,
        socket?: WebSocket,
    ): boolean {
        const agent =
            this.agents.get(nodeId);

        if (!agent) {
            return false;
        }

        /*
         * Если старая WebSocket-сессия закрылась уже после того,
         * как нода переподключилась, не удаляем новое соединение.
         */
        if (
            socket &&
            agent.socket !== socket
        ) {
            return false;
        }

        const deleted =
            this.agents.delete(nodeId);

        if (deleted) {
            console.log(
                `Node unregistered: nodeId=${nodeId}, online=${this.agents.size}`,
            );
        }

        return deleted;
    }

    public unregisterBySocket(
        socket: WebSocket,
    ): ConnectedAgent | null {
        for (const agent of this.agents.values()) {
            if (agent.socket !== socket) {
                continue;
            }

            this.agents.delete(
                agent.nodeId,
            );

            console.log(
                `Node unregistered by socket: nodeId=${agent.nodeId}, online=${this.agents.size}`,
            );

            return agent;
        }

        return null;
    }

    public find(
        nodeId: number,
    ): ConnectedAgent | null {
        return (
            this.agents.get(nodeId) ??
            null
        );
    }

    public findBySocket(
        socket: WebSocket,
    ): ConnectedAgent | null {
        for (const agent of this.agents.values()) {
            if (agent.socket === socket) {
                return agent;
            }
        }

        return null;
    }

    public has(nodeId: number): boolean {
        return this.agents.has(nodeId);
    }

    public isOnline(
        nodeId: number,
    ): boolean {
        const agent =
            this.agents.get(nodeId);

        return (
            agent !== undefined &&
            agent.socket.readyState ===
            WebSocket.OPEN
        );
    }

    public updateLastSeen(
        nodeId: number,
        date: Date = new Date(),
    ): boolean {
        const agent =
            this.agents.get(nodeId);

        if (!agent) {
            return false;
        }

        agent.lastSeenAt = date;

        return true;
    }

    public touchBySocket(
        socket: WebSocket,
        date: Date = new Date(),
    ): ConnectedAgent | null {
        const agent =
            this.findBySocket(socket);

        if (!agent) {
            return null;
        }

        agent.lastSeenAt = date;

        return agent;
    }

    public send(
        nodeId: number,
        message: unknown,
    ): boolean {
        const agent =
            this.agents.get(nodeId);

        if (!agent) {
            return false;
        }

        if (
            agent.socket.readyState !==
            WebSocket.OPEN
        ) {
            return false;
        }

        try {
            agent.socket.send(
                JSON.stringify(message),
            );

            return true;

        } catch (error) {

            console.error(
                `Failed to send message to node ${nodeId}`,
                error,
            );

            this.unregister(nodeId);

            return false;
        }

        return true;
    }

    public broadcast(
        message: unknown,
    ): number {
        const serialized =
            JSON.stringify(message);

        let sentCount = 0;

        for (const agent of this.agents.values()) {
            if (
                agent.socket.readyState !==
                WebSocket.OPEN
            ) {
                continue;
            }

            agent.socket.send(serialized);
            sentCount += 1;
        }

        return sentCount;
    }

    public list(): ConnectedAgent[] {
        return Array.from(
            this.agents.values(),
        );
    }

    public listInfo(): ConnectedAgentInfo[] {
        return this.list().map(
            (agent) => ({
                nodeId: agent.nodeId,

                remoteAddress:
                agent.remoteAddress,

                connectedAt:
                agent.connectedAt,

                lastSeenAt:
                agent.lastSeenAt,

                agentVersion:
                agent.agentVersion,

                nodeVersion:
                agent.nodeVersion,

                platform:
                agent.platform,

                architecture:
                agent.architecture,

                isConnected:
                    agent.socket.readyState ===
                    WebSocket.OPEN,
            }),
        );
    }

    public getOnlineCount(): number {
        let count = 0;

        for (const agent of this.agents.values()) {
            if (
                agent.socket.readyState ===
                WebSocket.OPEN
            ) {
                count += 1;
            }
        }

        return count;
    }

    public closeAll(
        code = 1001,
        reason = "Backend shutting down",
    ): void {
        for (const agent of this.agents.values()) {
            if (
                agent.socket.readyState ===
                WebSocket.OPEN ||
                agent.socket.readyState ===
                WebSocket.CONNECTING
            ) {
                agent.socket.close(
                    code,
                    reason,
                );
            }
        }

        this.agents.clear();
    }
}