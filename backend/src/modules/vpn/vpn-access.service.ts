import VpnCredential from "./vpn-credential.model";
import VpnNode from "../vpn-nodes/vpn-node.model";

import nodeControlService from "../../infrastructure/node-control/ssh-xray-node-control.service";

class VpnAccessService {
    async grant(
        credential: VpnCredential
    ): Promise<void> {
        const nodes = await VpnNode.findAll({
            where: {
                is_active: true,
            },
        });

        const results = await Promise.allSettled(
            nodes.map((node) =>
                nodeControlService.addUser(
                    node,
                    credential
                )
            )
        );

        const failedNodes = results
            .map((result, index) => ({
                result,
                node: nodes[index],
            }))
            .filter(
                ({ result }) =>
                    result.status === "rejected"
            );

        if (failedNodes.length > 0) {
            for (const {
                result,
                node,
            } of failedNodes) {
                console.error(
                    `[VPN] Failed to grant access on node ${node.name}`,
                    result.status === "rejected"
                        ? result.reason
                        : undefined
                );
            }

            throw new Error(
                `Failed to grant VPN access on ${failedNodes.length} node(s)`
            );
        }
    }

    async revoke(
        credential: VpnCredential
    ): Promise<void> {
        const nodes = await VpnNode.findAll({
            where: {
                is_active: true,
            },
        });

        const results = await Promise.allSettled(
            nodes.map((node) =>
                nodeControlService.removeUser(
                    node,
                    credential
                )
            )
        );

        const failedNodes = results
            .map((result, index) => ({
                result,
                node: nodes[index],
            }))
            .filter(
                ({ result }) =>
                    result.status === "rejected"
            );

        if (failedNodes.length > 0) {
            for (const {
                result,
                node,
            } of failedNodes) {
                console.error(
                    `[VPN] Failed to revoke access on node ${node.name}`,
                    result.status === "rejected"
                        ? result.reason
                        : undefined
                );
            }

            throw new Error(
                `Failed to revoke VPN access on ${failedNodes.length} node(s)`
            );
        }
    }
}

export default new VpnAccessService();