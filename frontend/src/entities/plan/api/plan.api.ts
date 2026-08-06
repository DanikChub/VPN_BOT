import {
    apiClient,
} from "@/shared/api";

import type {
    CreatePlanPayload,
    CreatePlanResponse,
    GetPlanByIdResponse,
    GetPlansResponse,
    UpdatePlanPayload,
    UpdatePlanResponse,
} from "../model";


export const planApi = {
    async getAll(): Promise<
        GetPlansResponse
    > {
        const response =
            await apiClient.get<
                GetPlansResponse
            >(
                "/admin/plans"
            );

        return response.data;
    },


    async getById(
        planId: number
    ): Promise<GetPlanByIdResponse> {
        const response =
            await apiClient.get<
                GetPlanByIdResponse
            >(
                `/admin/plans/${planId}`
            );

        return response.data;
    },


    async create(
        payload: CreatePlanPayload
    ): Promise<CreatePlanResponse> {
        const response =
            await apiClient.post<
                CreatePlanResponse
            >(
                "/admin/plans",
                payload
            );

        return response.data;
    },


    async update(
        planId: number,
        payload: UpdatePlanPayload
    ): Promise<UpdatePlanResponse> {
        const response =
            await apiClient.patch<
                UpdatePlanResponse
            >(
                `/admin/plans/${planId}`,
                payload
            );

        return response.data;
    },


    async deleteById(
        planId: number
    ): Promise<void> {
        await apiClient.delete(
            `/admin/plans/${planId}`
        );
    },
};