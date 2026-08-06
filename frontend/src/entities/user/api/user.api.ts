import {
    apiClient,
} from "@/shared/api";

import type {
    GetUsersParams,
    GetUsersResponse,
    GetUserByIdResponse, ExtendUserSubscriptionPayload, UserSubscriptionMutationResponse
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

    async getById(
        userId: number
    ): Promise<GetUserByIdResponse> {
        const response =
            await apiClient.get<GetUserByIdResponse>(
                `/admin/users/${userId}`
            );

        return response.data;
    },


    async extendSubscription(
        userId: number,
        payload:
            ExtendUserSubscriptionPayload
    ): Promise<UserSubscriptionMutationResponse> {
        const response =
            await apiClient.post<
                UserSubscriptionMutationResponse
            >(
                `/admin/users/${userId}/subscription/extend`,
                payload
            );

        return response.data;
    },


    async expireSubscription(
        userId: number
    ): Promise<UserSubscriptionMutationResponse> {
        const response =
            await apiClient.post<
                UserSubscriptionMutationResponse
            >(
                `/admin/users/${userId}/subscription/expire`
            );

        return response.data;
    },


    async blockSubscription(
        userId: number
    ): Promise<UserSubscriptionMutationResponse> {
        const response =
            await apiClient.post<
                UserSubscriptionMutationResponse
            >(
                `/admin/users/${userId}/subscription/block`
            );

        return response.data;
    },


    async unblockSubscription(
        userId: number
    ): Promise<UserSubscriptionMutationResponse> {
        const response =
            await apiClient.post<
                UserSubscriptionMutationResponse
            >(
                `/admin/users/${userId}/subscription/unblock`
            );

        return response.data;
    },
};