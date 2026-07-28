import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";

export enum AgentCommandType {
    ADD_USERS = "add-users",
    REMOVE_USERS = "remove-users",
    SYNC_USERS = "sync-users",

    RESTART_XRAY = "restart-xray",
    GET_STATUS = "get-status",
}

export interface XrayUser {
    uuid: string;
    email: string;
    flow: "xtls-rprx-vision";
}

export interface AddUsersCommandArguments {
    inboundTag: string;
    users: XrayUser[];
}

export interface RemoveUsersCommandArguments {
    inboundTag: string;
    emails: string[];
}

export type SyncUsersMode =
    | "reconcile"
    | "rebuild";

export interface SyncUsersCommandArguments {
    inboundTag: string;

    users: XrayUser[];

    mode: SyncUsersMode;
}

export interface CommandPayload {
    command: AgentCommandType;
    arguments: unknown;
}

export type CommandMessage = ProtocolMessage<
    MessageType.COMMAND,
    CommandPayload
>;