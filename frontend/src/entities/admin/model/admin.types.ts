export type AdminRole =
    | "superadmin"
    | "admin"
    | "support";

export type AdminStatus =
    | "active"
    | "blocked";

export interface Admin {
    id: number;

    email: string;
    role: AdminRole;
    status: AdminStatus;

    lastLoginAt: string | null;

    createdAt: string;
    updatedAt: string;
}