import { MessageType } from "./message-type.js";
import type { ProtocolMessage } from "./message.js";
import type {SyncUsersMode} from "./command.js";

export interface SuccessfulCommandResultPayload<
    TResult,
> {
    success: true;

    data: TResult;
}


export interface FailedCommandResultPayload {
    success: false;

    error: {
        code: string;
        message: string;
    };
}


export type CommandResultPayload<
    TResult = unknown,
> =
    | SuccessfulCommandResultPayload<TResult>
    | FailedCommandResultPayload;

export type CommandResultMessage<
    TResult = unknown,
> = ProtocolMessage<
    MessageType.COMMAND_RESULT,
    CommandResultPayload<TResult>
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
