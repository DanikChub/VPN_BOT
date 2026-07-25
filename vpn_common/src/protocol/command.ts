import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";

export enum AgentCommandType {
    ADD_USER = "add-user",
    REMOVE_USER = "remove-user",
    RESTART_XRAY = "restart-xray",
    GET_STATUS = "get-status",
}

export interface CommandPayload {
    command: AgentCommandType;
    arguments: unknown;
}

export type CommandMessage = ProtocolMessage<
    MessageType.COMMAND,
    CommandPayload
>;