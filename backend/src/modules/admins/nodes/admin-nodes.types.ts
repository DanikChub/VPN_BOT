import type VpnNode from "../../vpn-nodes/vpn-node.model";
import type {
    SyncUsersMode,
} from "@vpn/common";

export interface SyncNodeUsersDto {
    mode?: SyncUsersMode;
}

export interface SyncNodeUsersResponse {
    nodeId: number;
    mode: SyncUsersMode;
    synchronized: true;
}


export interface AdminNodeResponse {
    id: number;

    name: string;
    host: string;
    port: number;

    status: string;

    lastSeenAt: Date | null;

    cpu_count: number | null;
    cpu_model: string | null;


    memory_total: number | null;
    memory_used: number | null;


    uptime_seconds: number | null;
}


export function mapNodeToAdminResponse(
    node: VpnNode,
): AdminNodeResponse {

    return {
        id: node.id,

        name: node.name,
        host: node.host,
        port: node.port,

        status: node.status,

        lastSeenAt: node.last_seen_at,


        cpu_count:node.cpu_count,

        cpu_model: node.cpu_model,


        memory_total: node.memory_total,

        memory_used: node.memory_used,

        uptime_seconds: node.uptime_seconds,
    };
}

export interface CreateNodeDto {
    name: string;
    host: string;
    port: number;

    sshPort: number;
    sshUser: string;
    sshPassword: string;
}


export type EditableNodeField =
    | "name"
    | "display_name"
    | "country_code"
    | "sort_order"
    | "is_active";

export interface UpdateNodeFieldDto {
    field: EditableNodeField;
    value: unknown;
}