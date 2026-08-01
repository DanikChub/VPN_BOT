import VpnCredential from "./vpn-credential.model";
import VpnNode from "../vpn-nodes/vpn-node.model";
import {NodeControlService} from "./node-control/node-control.service";
import VpnNodeService from "../vpn-nodes/vpn-node.service";




export class VpnAccessService {
    public constructor(
        private readonly nodeControlService:
        NodeControlService,
    ) {}

    public async grant(
        credential: VpnCredential,
    ): Promise<void> {
        const nodes =
            await VpnNodeService.findAvailableNodes();

        const results =
            await Promise.allSettled(
                nodes.map(
                    (node) =>
                        this.nodeControlService.addUser(
                            node,
                            credential,
                        ),
                ),
            );

        const failedNodes =
            results
                .map(
                    (
                        result,
                        index,
                    ) => ({
                        result,
                        node:
                            nodes[index],
                    }),
                )
                .filter(
                    ({ result }) =>
                        result.status ===
                        "rejected",
                );

        if (
            failedNodes.length ===
            0
        ) {
            return;
        }

        for (
            const {
                result,
                node,
            } of failedNodes
            ) {
            console.error(
                `[VPN] Failed to grant access on node ${node.name}`,
                result.status ===
                "rejected"
                    ? result.reason
                    : undefined,
            );
        }

        throw new Error(
            `Failed to grant VPN access on ${failedNodes.length} node(s)`,
        );
    }

    public async revoke(
        credential: VpnCredential,
    ): Promise<void> {
        const nodes =
            await VpnNodeService.findAvailableNodes();

        const results =
            await Promise.allSettled(
                nodes.map(
                    (node) =>
                        this.nodeControlService.removeUser(
                            node,
                            credential,
                        ),
                ),
            );

        const failedNodes =
            results
                .map(
                    (
                        result,
                        index,
                    ) => ({
                        result,
                        node:
                            nodes[index],
                    }),
                )
                .filter(
                    ({ result }) =>
                        result.status ===
                        "rejected",
                );

        if (
            failedNodes.length ===
            0
        ) {
            return;
        }

        for (
            const {
                result,
                node,
            } of failedNodes
            ) {
            console.error(
                `[VPN] Failed to revoke access on node ${node.name}`,
                result.status ===
                "rejected"
                    ? result.reason
                    : undefined,
            );
        }

        throw new Error(
            `Failed to revoke VPN access on ${failedNodes.length} node(s)`,
        );
    }
}