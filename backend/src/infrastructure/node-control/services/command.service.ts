import { randomUUID } from "node:crypto";

import {
    MessageType,
    type CommandMessage,
    type CommandResultMessage, AgentCommandType,
} from "@vpn/common";

import type { NodeRegistry } from "../registry/node-registry";

interface PendingCommand {
    resolve(
        message: CommandResultMessage,
    ): void;

    reject(
        reason?: unknown,
    ): void;

    timeout: NodeJS.Timeout;
}

interface CommandServiceOptions {
    nodeRegistry: NodeRegistry;

    timeoutMs?: number;
}

export class CommandService {
    private readonly nodeRegistry: NodeRegistry;

    private readonly timeoutMs: number;

    private readonly pending =
        new Map<
            string,
            PendingCommand
        >();

    public constructor(
        options: CommandServiceOptions,
    ) {
        this.nodeRegistry =
            options.nodeRegistry;

        this.timeoutMs =
            options.timeoutMs ??
            30_000;
    }

    public async sendCommand(
        nodeId: number,
        command: AgentCommandType,
        arguments_: unknown,
    ): Promise<CommandResultMessage> {
        const requestId = randomUUID();

        const message: CommandMessage = {
            type: MessageType.COMMAND,
            requestId,
            payload: {
                command,
                arguments: arguments_,
            },
        };

        const sent = this.nodeRegistry.send(
            nodeId,
            message,
        );

        if (!sent) {
            throw new Error(
                `Node ${nodeId} is offline`,
            );
        }

        return await new Promise<CommandResultMessage>(
            (resolve, reject) => {
                const timeout = setTimeout(
                    () => {
                        this.pending.delete(
                            requestId,
                        );

                        reject(
                            new Error(
                                `Command "${command}" timed out for node ${nodeId}`,
                            ),
                        );
                    },
                    this.timeoutMs,
                );

                timeout.unref();

                this.pending.set(
                    requestId,
                    {
                        resolve,
                        reject,
                        timeout,
                    },
                );
            },
        );
    }

    public complete(
        message: CommandResultMessage,
    ): boolean {
        if (!message.requestId) {
            return false;
        }

        const pending =
            this.pending.get(
                message.requestId,
            );

        if (!pending) {
            return false;
        }

        clearTimeout(
            pending.timeout,
        );

        this.pending.delete(
            message.requestId,
        );

        pending.resolve(message);

        return true;
    }

    public rejectAll(
        reason: Error,
    ): void {
        for (const pending of this.pending.values()) {
            clearTimeout(
                pending.timeout,
            );

            pending.reject(reason);
        }

        this.pending.clear();
    }

    public getPendingCount(): number {
        return this.pending.size;
    }
}