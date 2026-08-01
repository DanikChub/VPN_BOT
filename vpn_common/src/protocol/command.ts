import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";
import type {AddUsersCommandResult, RemoveUsersCommandResult, SyncUsersCommandResult} from "./command-result.js";

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


export interface AgentCommandContractMap {
    [AgentCommandType.ADD_USERS]: {
        arguments:
            AddUsersCommandArguments;

        result:
            AddUsersCommandResult;
    };

    [AgentCommandType.REMOVE_USERS]: {
        arguments:
            RemoveUsersCommandArguments;

        result:
            RemoveUsersCommandResult;
    };

    [AgentCommandType.SYNC_USERS]: {
        arguments:
            SyncUsersCommandArguments;

        result:
            SyncUsersCommandResult;
    };
}

export type AgentCommandArguments<
    TType extends keyof AgentCommandContractMap,
> =
    AgentCommandContractMap[TType]["arguments"];


export type AgentCommandResult<
    TType extends keyof AgentCommandContractMap,
> =
    AgentCommandContractMap[TType]["result"];