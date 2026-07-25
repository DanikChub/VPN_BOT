import "dotenv/config";

import { z } from "zod";

const environmentSchema = z.object({
    NODE_ID: z.coerce
        .number()
        .int()
        .positive(),

    NODE_TOKEN: z
        .string()
        .min(32),

    CONTROL_SERVER_URL: z
        .string()
        .url()
        .refine(
            (value) =>
                value.startsWith("ws://") ||
                value.startsWith("wss://"),
            {
                message:
                    "CONTROL_SERVER_URL must use ws:// or wss://",
            }
        ),

    HEARTBEAT_INTERVAL_MS: z.coerce
        .number()
        .int()
        .min(1000)
        .default(10000),

    RECONNECT_MIN_DELAY_MS: z.coerce
        .number()
        .int()
        .min(500)
        .default(1000),

    RECONNECT_MAX_DELAY_MS: z.coerce
        .number()
        .int()
        .min(1000)
        .default(30000),

    XRAY_BINARY_PATH: z
        .string()
        .default("/usr/local/bin/xray"),

    XRAY_SERVICE_NAME: z
        .string()
        .default("xray"),

    LOG_LEVEL: z
        .enum([
            "debug",
            "info",
            "warn",
            "error",
        ])
        .default("info"),
});

function parseEnvironment() {
    const result =
        environmentSchema.safeParse(process.env);

    if (!result.success) {
        console.error(
            "Invalid agent environment configuration:"
        );

        console.error(
            result.error.flatten().fieldErrors
        );

        throw new Error(
            "Invalid environment configuration"
        );
    }

    return result.data;
}

const environment = parseEnvironment();

export const config = {
    nodeId: environment.NODE_ID,
    nodeToken: environment.NODE_TOKEN,

    controlServerUrl:
    environment.CONTROL_SERVER_URL,

    heartbeatIntervalMs:
    environment.HEARTBEAT_INTERVAL_MS,

    reconnectMinDelayMs:
    environment.RECONNECT_MIN_DELAY_MS,

    reconnectMaxDelayMs:
    environment.RECONNECT_MAX_DELAY_MS,

    xrayBinaryPath:
    environment.XRAY_BINARY_PATH,

    xrayServiceName:
    environment.XRAY_SERVICE_NAME,

    logLevel:
    environment.LOG_LEVEL,
} as const;

export type AgentConfig = typeof config;