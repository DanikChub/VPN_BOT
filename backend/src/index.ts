import "dotenv/config";

import http from "node:http";

import {
    MessageType,
    type HelloMessage,
    type HeartbeatMessage,
    type CommandResultMessage,
} from "@vpn/common";

import app from "./app";
import { initDatabase } from "./database";
import { startJobs } from "./jobs";

import {
    nodeRegistry,
    commandService,
} from "./infrastructure/container";
import {
    AgentWebSocketServer,
} from "./infrastructure/node-control/websocket/agent-websocket.server";

import {
    HelloHandler,
} from "./infrastructure/node-control/handlers/hello.handler";

import {
    HeartbeatHandler,
} from "./infrastructure/node-control/handlers/heartbeat.handler";

import {
    CommandResultHandler,
} from "./infrastructure/node-control/handlers/command-result.handler";


import createTestRouter from "./modules/test/test.router";

const PORT =
    Number(process.env.PORT) ||
    5000;

const start = async (): Promise<void> => {
    try {
        await initDatabase();

        startJobs();

        const httpServer =
            http.createServer(
                app,
            );


        const agentWebSocketServer =
            new AgentWebSocketServer({
                httpServer,
                nodeRegistry,
                path: "/ws/agent",
            });


        const helloHandler =
            new HelloHandler(
                nodeRegistry,
                commandService,
            );

        const heartbeatHandler =
            new HeartbeatHandler({
                nodeRegistry,
            });

        const commandResultHandler =
            new CommandResultHandler({
                nodeRegistry,
                commandService,
            });

        const messageRouter =
            agentWebSocketServer.getRouter();

        messageRouter.register<HelloMessage>(
            MessageType.HELLO,
            helloHandler.handle,
        );

        messageRouter.register<HeartbeatMessage>(
            MessageType.HEARTBEAT,
            heartbeatHandler.handle,
        );

        messageRouter.register<CommandResultMessage>(
            MessageType.COMMAND_RESULT,
            commandResultHandler.handle,
        );

        app.use(
            "/api/test",
            createTestRouter(
                commandService,
            ),
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

                console.log(
                    "Registered agent message types:",
                    messageRouter.getRegisteredMessageTypes(),
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