import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";

import type {
    Admin,
} from "@/entities/admin";

import {
    tokenStorage,
} from "@/shared/lib";

import {
    authApi,
} from "../api/authApi";

import {
    AuthContext,
} from "./AuthContext";

import type {
    AuthContextValue,
    AuthStatus,
    LoginCredentials,
} from "./auth.types";

export function AuthProvider({
                                 children,
                             }: PropsWithChildren) {
    const [admin, setAdmin] =
        useState<Admin | null>(null);

    const [status, setStatus] =
        useState<AuthStatus>(
            "initializing"
        );

    const logout = useCallback((): void => {
        tokenStorage.removeToken();

        setAdmin(null);
        setStatus("unauthenticated");
    }, []);

    const login = useCallback(
        async (
            credentials: LoginCredentials
        ): Promise<void> => {
            const response =
                await authApi.login(
                    credentials
                );
            console.log(response)
            tokenStorage.setToken(
                response.accessToken
            );

            setAdmin(response.admin);
            setStatus("authenticated");
        },
        []
    );

    useEffect(() => {
        let isActive = true;

        async function restoreSession(): Promise<void> {
            const token =
                tokenStorage.getToken();

            if (!token) {
                if (isActive) {
                    setStatus(
                        "unauthenticated"
                    );
                }

                return;
            }

            try {
                const response =
                    await authApi.getMe();

                if (!isActive) {
                    return;
                }

                setAdmin(response.admin);
                setStatus(
                    "authenticated"
                );
            } catch {
                tokenStorage.removeToken();

                if (!isActive) {
                    return;
                }

                setAdmin(null);
                setStatus(
                    "unauthenticated"
                );
            }
        }

        void restoreSession();

        return () => {
            isActive = false;
        };
    }, []);

    const value =
        useMemo<AuthContextValue>(
            () => ({
                admin,
                status,

                isAuthenticated:
                    status ===
                    "authenticated",

                isInitializing:
                    status ===
                    "initializing",

                login,
                logout,
            }),
            [
                admin,
                status,
                login,
                logout,
            ]
        );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}