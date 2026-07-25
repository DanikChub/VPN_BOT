import { AgentApp } from "./app.js";
import { logger } from "./logger/logger.js";

const app = new AgentApp();

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;

    try {
        await app.stop(signal);
        process.exit(0);
    } catch (error) {
        logger.error("Agent shutdown failed", {
            error:
                error instanceof Error
                    ? error.message
                    : String(error),
        });

        process.exit(1);
    }
}

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});

process.on(
    "uncaughtException",
    (error: Error) => {
        logger.error("Uncaught exception", {
            error: error.message,
            stack: error.stack,
        });

        void shutdown("uncaughtException");
    }
);

process.on(
    "unhandledRejection",
    (reason: unknown) => {
        logger.error("Unhandled rejection", {
            reason:
                reason instanceof Error
                    ? reason.message
                    : String(reason),
        });

        void shutdown("unhandledRejection");
    }
);

try {
    await app.start();
} catch (error) {
    logger.error("Agent startup failed", {
        error:
            error instanceof Error
                ? error.message
                : String(error),
    });

    process.exit(1);
}