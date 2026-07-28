import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";
import type {SyncUsersMode} from "./command.js";

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

export interface AddUsersCommandResult {
    inboundTag: string;

    addedEmails: string[];

    existingEmails: string[];

    totalUsers: number;
}

export interface RemoveUsersCommandResult {
    inboundTag: string;

    removedEmails: string[];

    missingEmails: string[];

    totalUsers: number;
}


export interface SyncUsersCommandResult {
    mode: SyncUsersMode;

    desiredEmails: string[];

    addedEmails: string[];

    removedEmails: string[];

    totalUsers: number;
}
