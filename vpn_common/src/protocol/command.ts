import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";

export enum AgentCommandType {
    CONFIGURE_XRAY = "configure-xray",

    ADD_USERS = "add-users",
    REMOVE_USERS = "remove-users",

    RESTART_XRAY = "restart-xray",
    GET_STATUS = "get-status",
}

export interface ConfigureXrayCommandArguments {
    port: number;

    inboundTag: string;

    serverName: string;
}

export interface ConfigureXrayCommandResult {
    port: number;

    inboundTag: string;

    serverName: string;

    realityPublicKey: string;

    realityShortId: string;

    apiAddress: string;

    configPath: string;
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

export interface CommandPayload {
    command: AgentCommandType;

    arguments: unknown;
}

export type CommandMessage = ProtocolMessage<
    MessageType.COMMAND,
    CommandPayload
>;

