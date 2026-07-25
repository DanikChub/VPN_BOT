import type { MessageType } from "./message-type.js";

export interface ProtocolMessage<
    TType extends MessageType = MessageType,
    TPayload = unknown,
> {
    type: TType;
    requestId?: string;
    payload: TPayload;
}