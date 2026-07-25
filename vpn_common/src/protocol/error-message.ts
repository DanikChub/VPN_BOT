import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";

export interface ErrorPayload {
    code: string;
    message: string;
}

export type ErrorMessage = ProtocolMessage<
    MessageType.ERROR,
    ErrorPayload
>;