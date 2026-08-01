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
    SyncUsersCommandResult,
    SyncUsersMode,
} from "@vpn/common";
import VpnCredentialService from "./vpn-credential.service";
import VpnNodeService from "../vpn-nodes/vpn-node.service";


export interface SyncAllNodesResult {
    synchronizedNodeIds: number[];
    failedNodeIds: number[];
}


export class NodeSyncService {

    constructor(
        private readonly nodeControlService:
        NodeControlService,
    ) {}


    async syncNode(
        node: VpnNode,
        mode: SyncUsersMode = "reconcile",
    ): Promise<SyncUsersCommandResult> {

        const credentials =
            await VpnCredentialService.findAllActive();;


        return this.nodeControlService
            .syncUsers(
                node,
                credentials,
                mode,
            );
    }


    public async syncAllNodes(
        mode: SyncUsersMode = "reconcile",
    ): Promise<SyncAllNodesResult> {

        const nodes =
            await VpnNodeService.findAvailableNodes();


        const credentials =
            await VpnCredentialService.findAllActive();



        const synchronizedNodeIds: number[] =
            [];

        const failedNodeIds: number[] =
            [];


        for (const node of nodes) {
            try {
                await this.nodeControlService.syncUsers(
                    node,
                    credentials,
                    mode,
                );

                synchronizedNodeIds.push(
                    node.id,
                );
            } catch (error) {
                failedNodeIds.push(
                    node.id,
                );

                console.error(
                    `[NODE_SYNC] Failed to synchronize node ${node.id}:`,
                    error instanceof Error
                        ? error.message
                        : error,
                );
            }
        }


        return {
            synchronizedNodeIds,
            failedNodeIds,
        };
    }

}