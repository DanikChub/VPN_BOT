import {
    apiClient,
} from "@/shared/api";


import type {
    MarketingSource,

    CreateMarketingSourceDto,
    UpdateMarketingSourceDto,

    MarketingSourceUsersResponse,

} from "../model";


export const marketingSourceApi = {


    async getAll(
        params?: {
            is_active?: boolean;

            type?: string;

            search?: string;
        }
    ): Promise<MarketingSource[]> {


        const response =
            await apiClient.get<MarketingSource[]>(
                "/admin/marketing-sources",
                {
                    params,
                }
            );


        return response.data;
    },



    async getById(
        id:number,
    ): Promise<MarketingSource> {


        const response =
            await apiClient.get<MarketingSource>(
                `/admin/marketing-sources/${id}`
            );


        return response.data;
    },



    async create(
        data:CreateMarketingSourceDto,
    ): Promise<MarketingSource> {


        const response =
            await apiClient.post<MarketingSource>(
                "/admin/marketing-sources",
                data,
            );


        return response.data;
    },



    async update(
        id:number,
        data:UpdateMarketingSourceDto,
    ): Promise<MarketingSource> {


        const response =
            await apiClient.patch<MarketingSource>(
                `/admin/marketing-sources/${id}`,
                data,
            );


        return response.data;
    },



    async delete(
        id:number,
    ): Promise<MarketingSource> {


        const response =
            await apiClient.delete<MarketingSource>(
                `/admin/marketing-sources/${id}`,
            );


        return response.data;
    },



    async restore(
        id:number,
    ): Promise<MarketingSource> {


        const response =
            await apiClient.post<MarketingSource>(
                `/admin/marketing-sources/${id}/restore`,
            );


        return response.data;
    },



    async getUsers(
        id:number,
    ): Promise<MarketingSourceUsersResponse> {


        const response =
            await apiClient.get<MarketingSourceUsersResponse>(
                `/admin/marketing-sources/${id}/users`,
            );


        return response.data;
    },

};