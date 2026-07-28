export type SyncUsersMode =
    | "reconcile"
    | "rebuild";


export interface SyncUsersCommandUser {
    uuid: string;

    email: string;

    flow:
        "xtls-rprx-vision";
}


export interface SyncUsersCommandPayload {
    inboundTag: string;

    users:
        SyncUsersCommandUser[];

    mode:
        SyncUsersMode;
}


export interface SyncUsersCommandResult {
    mode:
        SyncUsersMode;

    desiredEmails:
        string[];

    addedEmails:
        string[];

    removedEmails:
        string[];

    totalUsers:
        number;
}