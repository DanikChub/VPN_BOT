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

        const node =
            await VpnNode.findByPk(
                nodeId,
            );


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



    public async markReady(
        nodeId: number,
        info: {
            version: string;
            nodeVersion?: string;
            platform?: string;
            architecture?: string;
        },
    ): Promise<void> {

        const node =
            await VpnNode.findByPk(nodeId);

        if (!node) {
            throw new Error(
                "VPN node not found",
            );
        }

        await node.update({

            install_status:
                "ready",

            status:
                "online",

            last_seen_at:
                new Date(),

        });

    }

    public async findAvailableNodes(): Promise<VpnNode[]> {

        return VpnNode.findAll({
            where: {
                is_active: true,
                status: "online",
            },

            order: [
                ["id", "ASC"],
            ],
        });
    }

    public async findAvailableExitNodes(): Promise<VpnNode[]> {
        return VpnNode.findAll({
            where: {
                is_active: true,
                status: "online",
                role: "exit",
            },

            order: [
                ["id", "ASC"],
            ],
        });
    }

    public async findAvailableGateways(): Promise<VpnNode[]> {
        return VpnNode.findAll({
            where: {
                is_active: true,
                status: "online",
                role: "gateway",
            },

            order: [
                ["id", "ASC"],
            ],
        });
    }

}


export default new VpnNodeService();