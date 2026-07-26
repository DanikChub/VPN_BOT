import type VpnNode from "../../vpn-nodes/vpn-node.model";


export interface AdminNodeResponse {
    id: number;

    name: string;
    host: string;
    port: number;

    status: string;

    lastSeenAt: Date | null;

    cpu: {
        count: number | null;
        model: string | null;
    };

    memory: {
        total: number | null;
        used: number | null;
    };

    uptimeSeconds: number | null;
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

        lastSeenAt:
            node.last_seen_at,

        cpu: {
            count:
                node.cpu_count,

            model:
                node.cpu_model,
        },

        memory: {
            total:
                node.memory_total,

            used:
                node.memory_used,
        },

        uptimeSeconds:
            node.uptime_seconds,
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