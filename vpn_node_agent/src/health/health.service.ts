import os from "node:os";

import type {
    HealthInfo,
} from "./health.types.js";


export class HealthService {

    async getHealth(): Promise<HealthInfo> {

        const cpus =
            os.cpus();


        const totalMemory =
            os.totalmem();


        const freeMemory =
            os.freemem();


        return {
            timestamp:
                new Date()
                    .toISOString(),


            uptimeSeconds:
                os.uptime(),


            cpu: {
                count:
                cpus.length,

                model:
                    cpus[0]?.model ??
                    "unknown",
            },


            memory: {
                total:
                totalMemory,

                free:
                freeMemory,

                used:
                    totalMemory -
                    freeMemory,
            },
        };
    }
}