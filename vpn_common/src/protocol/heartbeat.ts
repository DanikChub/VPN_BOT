import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";


export interface HeartbeatPayload {

    timestamp: string;

    uptimeSeconds: number;

    cpu: {
        count: number;
        model: string;
    };

    memory: {
        total: number;
        free: number;
        used: number;
    };

}


export type HeartbeatMessage =
    ProtocolMessage<
        MessageType.HEARTBEAT,
        HeartbeatPayload
    >;