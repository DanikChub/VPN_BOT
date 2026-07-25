import type {
    AdminRole,
    AdminStatus,
} from "../admin.model";

export interface AdminLoginInput {
    email: string;
    password: string;
}

export interface AdminPublicData {
    id: number;
    email: string;
    role: AdminRole;
    status: AdminStatus;
    lastLoginAt: Date | null;
    createdAt: Date;
}

export interface AdminLoginResult {
    accessToken: string;
    admin: AdminPublicData;
}

export interface AdminAccessTokenPayload {
    adminId: number;
    tokenType: "admin_access";
}