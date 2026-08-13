import type {EditableVpnNodeField, VpnNode} from "@/entities/vpn-node/model";
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

    async getDetails(
        nodeId: number,
    ): Promise<VpnNode> {
        const response =
            await apiClient.get<VpnNode>(
                `/admin/nodes/${nodeId}/details`,
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

    async updateField(
        nodeId: number,
        field: EditableVpnNodeField,
        value: unknown,
    ): Promise<VpnNode> {

        const response =
            await apiClient.patch<VpnNode>(
                `/admin/nodes/${nodeId}`,
                {
                    field,
                    value,
                },
            );

        return response.data;
    },

    async delete(
        nodeId: number,
    ): Promise<void> {
        await apiClient.delete(
            `/admin/nodes/${nodeId}`,
        );
    },
};