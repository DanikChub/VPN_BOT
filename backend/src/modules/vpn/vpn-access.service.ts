import VpnCredential from "./vpn-credential.model";
import { NodeControlService } from "./node-control/node-control.service";
import VpnNodeService from "../vpn-nodes/vpn-node.service";

export class VpnAccessService {
    public constructor(
        private readonly nodeControlService: NodeControlService,
    ) {}

    public async grant(
        credential: VpnCredential,
    ): Promise<void> {
        const nodes =
            await VpnNodeService.findAvailableNodes();

        if (nodes.length === 0) {
            throw new Error(
                "No available VPN nodes",
            );
        }

        const results =
            await Promise.allSettled(
                nodes.map(
                    node =>
                        this.nodeControlService.addUser(
                            node,
                            credential,
                        ),
                ),
            );

        const failedNodes =
            results
                .map((result, index) => ({
                    result,
                    node: nodes[index],
                }))
                .filter(
                    ({ result }) =>
                        result.status === "rejected",
                );

        const succeededCount =
            results.length - failedNodes.length;

        for (const {
            result,
            node,
        } of failedNodes) {
            console.error(
                `[VPN] Failed to grant access on node ${node.name}`,
                result.status === "rejected"
                    ? result.reason
                    : undefined,
            );
        }

        /*
         * Частичный успех — это нормально.
         *
         * Например:
         * node 1 -> success
         * node 2 -> offline
         * node 3 -> success
         *
         * Пользователю доступ уже выдан,
         * поэтому исключение наверх не бросаем.
         */
        if (succeededCount > 0) {
            return;
        }

        /*
         * Если не удалось добавить пользователя
         * вообще ни на одну ноду — это уже
         * настоящий провал выдачи VPN.
         */
        throw new Error(
            "Failed to grant VPN access on all nodes",
        );
    }

    public async revoke(
        credential: VpnCredential,
    ): Promise<void> {
        const nodes =
            await VpnNodeService.findAvailableNodes();

        if (nodes.length === 0) {
            return;
        }

        const results =
            await Promise.allSettled(
                nodes.map(
                    node =>
                        this.nodeControlService.removeUser(
                            node,
                            credential,
                        ),
                ),
            );

        const failedNodes =
            results
                .map((result, index) => ({
                    result,
                    node: nodes[index],
                }))
                .filter(
                    ({ result }) =>
                        result.status === "rejected",
                );

        const succeededCount =
            results.length - failedNodes.length;

        for (const {
            result,
            node,
        } of failedNodes) {
            console.error(
                `[VPN] Failed to revoke access on node ${node.name}`,
                result.status === "rejected"
                    ? result.reason
                    : undefined,
            );
        }

        /*
         * Если хотя бы часть нод успешно
         * обработала удаление — основной
         * пользовательский сценарий не ломаем.
         *
         * Отставшую ноду потом должен
         * догнать reconcile.
         */
        if (succeededCount > 0) {
            return;
        }

        throw new Error(
            "Failed to revoke VPN access on all nodes",
        );
    }
}