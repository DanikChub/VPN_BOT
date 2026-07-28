import { config } from "./config/config.js";
import { logger } from "./logger/logger.js";

import {
    AgentConnection,
} from "./connection/agent-connection.js";

import {
    CommandRouter,
} from "./commands/command-router.js";

import {
    AgentCommandType,
} from "@vpn/common";

import {
    getStatusHandler,
} from "./commands/handlers/get-status.handler.js";

import {
    HeartbeatService,
} from "./heartbeat/heartbeat.service.js";

import {
    HealthService,
} from "./health/health.service.js";

import {
    AddUsersHandler,
} from "./commands/handlers/add-users.handler.js";

import {
    RemoveUsersHandler,
} from "./commands/handlers/remove-users.handler.js";

import {
    SyncUsersHandler,
} from "./commands/handlers/sync-users.handler.js";

import {
    XrayApiClient,
} from "./xray/api/xray-api.client.js";

import {
    XrayUserService,
} from "./xray/xray-user.service.js";

import {
    XrayAppliedUsersStore,
} from "./xray/xray-applied-users.store.js";

export class AgentApp {
    private isStarted = false;

    private readonly connection:
        AgentConnection;

    private readonly heartbeatService:
        HeartbeatService;

    private readonly addUsersHandler:
        AddUsersHandler;

    private readonly removeUsersHandler:
        RemoveUsersHandler;

    private readonly syncUsersHandler:
        SyncUsersHandler;

    public constructor() {
        this.connection =
            new AgentConnection({
                url:
                config.controlServerUrl,

                nodeId:
                config.nodeId,

                token:
                config.nodeToken,

                agentVersion:
                    process.env
                        .npm_package_version ??
                    "unknown",

                logger,
            });

        const healthService =
            new HealthService();

        this.heartbeatService =
            new HeartbeatService(
                this.connection,
                healthService,
            );

        const xrayApiClient =
            new XrayApiClient();

        const xrayUserService =
            new XrayUserService(
                xrayApiClient,
            );

        /*
         * Один общий экземпляр store
         * для всех Xray handlers.
         */
        const xrayAppliedUsersStore =
            new XrayAppliedUsersStore();

        this.addUsersHandler =
            new AddUsersHandler(
                xrayUserService,
                xrayAppliedUsersStore,
            );

        this.removeUsersHandler =
            new RemoveUsersHandler(
                xrayUserService,
                xrayAppliedUsersStore,
            );

        this.syncUsersHandler =
            new SyncUsersHandler(
                xrayUserService,
                xrayAppliedUsersStore,
            );
    }

    public async start():
        Promise<void> {
        if (this.isStarted) {
            return;
        }

        logger.info(
            "VPN node agent is starting",
            {
                nodeId:
                config.nodeId,

                controlServerUrl:
                config.controlServerUrl,

                version:
                    process.env
                        .npm_package_version ??
                    "unknown",

                pid:
                process.pid,

                nodeVersion:
                process.version,
            },
        );

        const commandRouter =
            new CommandRouter();

        commandRouter.register(
            AgentCommandType.GET_STATUS,
            getStatusHandler,
        );

        commandRouter.register(
            AgentCommandType.ADD_USERS,
            this.addUsersHandler.handle,
        );

        commandRouter.register(
            AgentCommandType.REMOVE_USERS,
            this.removeUsersHandler.handle,
        );

        commandRouter.register(
            AgentCommandType.SYNC_USERS,
            this.syncUsersHandler.handle,
        );

        this.connection.setCommandRouter(
            commandRouter,
        );

        try {
            await this.connection.connect();

            this.heartbeatService.start();

            this.isStarted = true;

            logger.info(
                "VPN node agent started",
            );
        } catch (error) {
            logger.error(
                "Failed to start VPN node agent",
                {
                    error:
                        error instanceof Error
                            ? error.message
                            : String(error),
                },
            );

            throw error;
        }
    }

    public async stop(
        signal: string,
    ): Promise<void> {
        if (!this.isStarted) {
            return;
        }

        logger.info(
            "VPN node agent is stopping",
            {
                signal,
            },
        );

        try {
            this.heartbeatService.stop();

            await this.connection.disconnect();
        } catch (error) {
            logger.error(
                "Failed to disconnect from control server",
                {
                    error:
                        error instanceof Error
                            ? error.message
                            : String(error),
                },
            );
        }

        this.isStarted = false;

        logger.info(
            "VPN node agent stopped",
        );
    }
}