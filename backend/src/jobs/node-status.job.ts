import {
    Op,
} from "sequelize";

import VpnNode
    from "../modules/vpn-nodes/vpn-node.model";


export default class NodeStatusJob {

    private readonly offlineTimeoutMs =
        30_000;


    public async run(): Promise<void> {

        const offlineBefore =
            new Date(
                Date.now() -
                this.offlineTimeoutMs
            );


        const [updatedCount] =
            await VpnNode.update(
                {
                    status:
                        "offline",
                },
                {
                    where: {
                        status:
                            "online",

                        last_seen_at: {
                            [Op.lt]:
                            offlineBefore,
                        },
                    },
                },
            );


        if (
            updatedCount > 0
        ) {
            console.log(
                `[NODE STATUS] ${updatedCount} node(s) marked offline`
            );
        }
    }
}