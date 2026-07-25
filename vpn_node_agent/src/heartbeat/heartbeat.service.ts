import {
    MessageType,
    type HeartbeatMessage,
} from "@vpn/common";

import type {
    AgentConnection,
} from "../connection/agent-connection.js";

import {
    HealthService,
} from "../health/health.service.js";


export class HeartbeatService {

    private timer: NodeJS.Timeout | undefined;


    constructor(
        private readonly connection: AgentConnection,

        private readonly healthService: HealthService,

        private readonly intervalMs = 10000,
    ) {}


    start(): void {

        void this.send();


        this.timer =
            setInterval(
                () => {
                    void this.send();
                },
                this.intervalMs,
            );
    }


    stop(): void {

        if (!this.timer) {
            return;
        }


        clearInterval(
            this.timer,
        );


        this.timer = undefined;
    }


    private async send(): Promise<void> {

        const health =
            await this.healthService.getHealth();


        const message:
            HeartbeatMessage = {

            type:
            MessageType.HEARTBEAT,


            payload:
            health,
        };


        this.connection.send(
            message,
        );
    }
}