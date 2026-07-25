import VpnNode from "./vpn-node.model";


interface HeartbeatPayload {

    timestamp?: string;

    uptimeSeconds?: number;

    cpu?: {
        count?: number;
        model?: string;
    };

    memory?: {
        total?: number;
        used?: number;
        free?: number;
    };
}

class VpnNodeService {


    async updateHeartbeat(
        nodeId: number,
        heartbeat: HeartbeatPayload,
    ): Promise<VpnNode> {
        console.log(nodeId)
        const node =
            await VpnNode.findByPk(
                nodeId,
            );
        console.log(node)

        if (!node) {
            throw new Error(
                `VPN node ${nodeId} not found`,
            );
        }


        await node.update({

            status:
                "online",


            last_seen_at:
                new Date(),


            cpu_count:
                heartbeat.cpu?.count
                ??
                null,


            cpu_model:
                heartbeat.cpu?.model
                ??
                null,


            memory_total:
                heartbeat.memory?.total
                ??
                null,


            memory_used:
                heartbeat.memory?.used
                ??
                null,


            uptime_seconds:
                heartbeat.uptimeSeconds !== undefined
                    ? Math.floor(
                        heartbeat.uptimeSeconds,
                    )
                    : null,

        });


        return node;
    }



    async markOffline(
        nodeId: number,
    ): Promise<void> {

        await VpnNode.update(
            {
                status:
                    "offline",
            },
            {
                where: {
                    id: nodeId,
                },
            },
        );
    }



    async getById(
        nodeId: number,
    ): Promise<VpnNode | null> {

        return VpnNode.findByPk(
            nodeId,
        );
    }

    async create(
        data: {
            name: string;

            host: string;

            port: number;

            ssh_port: number;

            ssh_user: string;

            reality_public_key: string;

            reality_server_name: string;

            reality_short_id: string;
        },
    ): Promise<VpnNode> {

        return VpnNode.create({
            ...data,

            is_active: true,

        });
    }



    async getAll(): Promise<VpnNode[]> {

        return VpnNode.findAll({
            order: [
                [
                    "id",
                    "ASC",
                ],
            ],
        });
    }



}


export default new VpnNodeService();