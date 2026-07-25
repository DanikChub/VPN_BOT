import { config } from "../config/config.js";

type LogLevel =
    | "debug"
    | "info"
    | "warn"
    | "error";

const priorities: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

function shouldWrite(level: LogLevel): boolean {
    return (
        priorities[level] >=
        priorities[config.logLevel]
    );
}

function serializeContext(
    context?: Record<string, unknown>
): string {
    if (!context) {
        return "";
    }

    return ` ${JSON.stringify(context)}`;
}

function write(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
): void {
    if (!shouldWrite(level)) {
        return;
    }

    const line =
        `${new Date().toISOString()} ` +
        `[${level.toUpperCase()}] ` +
        `${message}` +
        serializeContext(context);

    switch (level) {
        case "error":
            console.error(line);
            break;

        case "warn":
            console.warn(line);
            break;

        default:
            console.log(line);
    }
}

export const logger = {
    debug(
        message: string,
        context?: Record<string, unknown>
    ): void {
        write("debug", message, context);
    },

    info(
        message: string,
        context?: Record<string, unknown>
    ): void {
        write("info", message, context);
    },

    warn(
        message: string,
        context?: Record<string, unknown>
    ): void {
        write("warn", message, context);
    },

    error(
        message: string,
        context?: Record<string, unknown>
    ): void {
        write("error", message, context);
    },
};