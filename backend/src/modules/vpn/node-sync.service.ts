import VpnNode
    from "../vpn-nodes/vpn-node.model";

import VpnCredential
    from "./vpn-credential.model";

import User
    from "../users/user.model";

import Subscription
    from "../subscriptions/subscription.model";

import type {
    NodeControlService,
} from "./node-control/node-control.service";

import type {
    SyncUsersMode,
} from "@vpn/common";



export class NodeSyncService {


    constructor(
        private readonly nodeControlService:
        NodeControlService,
    ){}



    async syncNode(
        node: VpnNode,
        mode: SyncUsersMode = "reconcile",
    ): Promise<void> {


        const credentials =
            await VpnCredential.findAll({
                include:[
                    {
                        model: User,
                        as: "user",
                        required: true,

                        include:[
                            {
                                model: Subscription,
                                as: "subscription",
                                required: true,

                                where:{
                                    status:
                                        "active",
                                },
                            },
                        ],
                    },
                ],
            });



        await this.nodeControlService.syncUsers(
            node,
            credentials,
            mode,
        );
    }
}