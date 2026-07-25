import {
    apiClient,
} from "@/shared/api";

import type {
    GetUsersParams,
    GetUsersResponse,
} from "../model";

export const userApi = {
    async getAll(
        params: GetUsersParams
    ): Promise<GetUsersResponse> {
        const response =
            await apiClient.get<GetUsersResponse>(
                "/admin/users",
                {
                    params,
                }
            );

        return response.data;
    },
};