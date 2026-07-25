import type {
    Admin,
} from "@/entities/admin";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    admin: Admin;
}

export interface MeResponse {
    admin: Admin;
}

export type AuthStatus =
    | "initializing"
    | "authenticated"
    | "unauthenticated";

export interface AuthContextValue {
    admin: Admin | null;
    status: AuthStatus;

    isAuthenticated: boolean;
    isInitializing: boolean;

    login: (
        credentials: LoginCredentials
    ) => Promise<void>;

    logout: () => void;
}