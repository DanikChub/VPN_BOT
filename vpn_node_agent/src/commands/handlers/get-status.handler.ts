import os from "node:os";

import {
    logger,
} from "../../logger/logger.js";

import type {
    CommandHandlerContext,
} from "../command-router.js";


export async function getStatusHandler(
    context: CommandHandlerContext,
) {

    logger.info(
        "Executing get-status command",
        {
            requestId:
            context.requestId,
        },
    );


    const uptime =
        os.uptime();


    const memoryTotal =
        os.totalmem();


    const memoryFree =
        os.freemem();


    const memoryUsed =
        memoryTotal -
        memoryFree;



    return {
        status: "online",

        hostname:
            os.hostname(),


        platform:
            os.platform(),


        architecture:
            os.arch(),


        nodeVersion:
        process.version,


        uptimeSeconds:
        uptime,


        memory: {
            total:
            memoryTotal,

            free:
            memoryFree,

            used:
            memoryUsed,
        },


        cpu: {
            count:
            os.cpus().length,

            model:
                os.cpus()[0]?.model ??
                "unknown",
        },


        timestamp:
            new Date().toISOString(),
    };
}