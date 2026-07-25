import {
    apiClient,
} from "@/shared/api";

import type {
    LoginCredentials,
    LoginResponse,
    MeResponse,
} from "../model/auth.types";

async function login(
    credentials: LoginCredentials
): Promise<LoginResponse> {
    const response =
        await apiClient.post<LoginResponse>(
            "/admin/auth/login",
            credentials
        );

    return response.data;
}

async function getMe(): Promise<MeResponse> {
    const response =
        await apiClient.get<MeResponse>(
            "/admin/auth/me"
        );

    return response.data;
}

export const authApi = {
    login,
    getMe,
};