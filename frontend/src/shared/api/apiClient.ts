import axios from "axios";

import { env } from "@/shared/config/env";
import { tokenStorage } from "@/shared/lib/tokenStorage";

export const apiClient = axios.create({
    baseURL: env.apiUrl,
    timeout: 10_000,

    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token =
            tokenStorage.getToken();

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    }
);