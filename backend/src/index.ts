import "dotenv/config";

import http from "node:http";

import app from "./app";
import { initDatabase } from "./database";
import { startJobs } from "./jobs";

import { NodeRegistry } from "./infrastructure/node-control/registry/node-registry";
import { AgentWebSocketServer } from "./infrastructure/node-control/websocket/agent-websocket.server";
import {
    MessageType,
    type HelloMessage,
} from "@vpn/common";

import { HelloHandler } from "./infrastructure/node-control/handlers/hello.handler";
import { HeartbeatHandler } from "./infrastructure/node-control/handlers/heartbeat.handler";
import {CommandService} from "./infrastructure/node-control/services/command.service";
import {CommandResultHandler} from "./infrastructure/node-control/handlers/command-result.handler";

import createTestRouter from "./modules/test/test.router";

const PORT =
    Number(process.env.PORT) ||
    5000;

const start = async (): Promise<void> => {
    try {
        await initDatabase();

        startJobs();

        const httpServer =
            http.createServer(app);

        const nodeRegistry =
            new NodeRegistry();

        const agentWebSocketServer =
            new AgentWebSocketServer({
                httpServer,
                nodeRegistry,
                path: "/ws/agent",


            });

        const nodeAgentToken =
            process.env.NODE_AGENT_TOKEN;

        if (!nodeAgentToken) {
            throw new Error(
                "NODE_AGENT_TOKEN is not configured",
            );
        }

        const helloHandler =
            new HelloHandler({
                nodeRegistry,

                expectedToken:
                nodeAgentToken,

                heartbeatIntervalMs:
                    10_000,

                markAuthenticated:
                    (socket) => {
                        agentWebSocketServer
                            .markAuthenticated(
                                socket,
                            );
                    },
            });

        const heartbeatHandler =
            new HeartbeatHandler({
                nodeRegistry,
            });

        const commandService =
            new CommandService({
                nodeRegistry,
            });



        const commandResultHandler =
            new CommandResultHandler({
                nodeRegistry,
                commandService,
            });

        app.use(
            "/api/test",
            createTestRouter(
                commandService,
            ),
        );

        const router =
            agentWebSocketServer.getRouter();

        router.register<HelloMessage>(
            MessageType.HELLO,
            helloHandler.handle,
        );

        router.register(
            MessageType.HEARTBEAT,
            heartbeatHandler.handle,
        );

        router.register(
            MessageType.COMMAND_RESULT,
            commandResultHandler.handle,
        );

        httpServer.listen(
            PORT,
            () => {
                console.log(
                    `Backend started on port ${PORT}`,
                );

                console.log(
                    `Agent WebSocket endpoint: ws://localhost:${PORT}/ws/agent`,
                );
            },
        );

        let isShuttingDown =
            false;

        const shutdown = async (
            signal: string,
        ): Promise<void> => {
            if (isShuttingDown) {
                return;
            }

            isShuttingDown =
                true;

            console.log(
                `Received ${signal}. Backend is shutting down...`,
            );

            try {
                await agentWebSocketServer.close();

                await new Promise<void>(
                    (
                        resolve,
                        reject,
                    ) => {
                        httpServer.close(
                            (error) => {
                                if (error) {
                                    reject(
                                        error,
                                    );

                                    return;
                                }

                                resolve();
                            },
                        );
                    },
                );

                console.log(
                    "Backend stopped",
                );

                process.exit(0);
            } catch (error) {
                console.error(
                    "Failed to stop backend:",
                    error,
                );

                process.exit(1);
            }
        };

        process.once(
            "SIGINT",
            () => {
                void shutdown(
                    "SIGINT",
                );
            },
        );

        process.once(
            "SIGTERM",
            () => {
                void shutdown(
                    "SIGTERM",
                );
            },
        );
    } catch (error) {
        console.error(
            "Failed to start backend:",
            error,
        );

        process.exit(1);
    }
};

void start();