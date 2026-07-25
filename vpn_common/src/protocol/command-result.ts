import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";

export interface CommandResultPayload {
    success: boolean;
    data?: unknown;
    error?: {
        code: string;
        message: string;
    };
}

export type CommandResultMessage = ProtocolMessage<
    MessageType.COMMAND_RESULT,
    CommandResultPayload
>;