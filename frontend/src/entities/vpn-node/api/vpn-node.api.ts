import type {VpnNode} from "@/entities/vpn-node/model";
import {apiClient} from "@/shared/api";
import type {CreateVpnNodeDto} from "@/entities/vpn-node/model";



export const vpnNodeApi = {
    async getAll(): Promise<VpnNode[]> {

        const response =
            await apiClient.get<VpnNode[]>(
                "/admin/nodes",
            );


        return response.data;
    },

    async create(
        data: CreateVpnNodeDto,
    ): Promise<VpnNode> {

        const response =
            await apiClient.post<VpnNode>(
                "/admin/nodes",
                data,
            );

        return response.data;
    },
};