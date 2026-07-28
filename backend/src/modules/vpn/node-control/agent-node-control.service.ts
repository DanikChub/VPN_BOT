import type {
    SyncUsersMode,
} from "@vpn/common";

import {
    AddUsersCommand,
} from "../../../infrastructure/agent/commands/add-users/add-users.command";

import {
    RemoveUsersCommand,
} from "../../../infrastructure/agent/commands/remove-users/remove-users.command";

import {
    SyncUsersCommand,
} from "../../../infrastructure/agent/commands/sync-users/sync-users.command";

import type {
    AgentCommandBus,
} from "../../../infrastructure/agent/command-bus/agent-command-bus";

import type {
    NodeControlService,
} from "./node-control.service";

import VpnNode
    from "../../vpn-nodes/vpn-node.model";

import VpnCredential
    from "../vpn-credential.model";

class AgentNodeControlService
    implements NodeControlService {

    public constructor(
        private readonly commandBus:
        AgentCommandBus,
    ) {}

    public async addUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<void> {
        const command =
            new AddUsersCommand({
                inboundTag:
                node.inbound_tag,

                users: [
                    {
                        uuid:
                        credential.uuid,

                        email:
                            this.getCredentialEmail(
                                credential,
                            ),

                        flow:
                            "xtls-rprx-vision",
                    },
                ],
            });

        await this.commandBus.execute(
            node.id,
            command,
        );
    }

    public async removeUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<void> {
        const command =
            new RemoveUsersCommand({
                inboundTag:
                node.inbound_tag,

                emails: [
                    this.getCredentialEmail(
                        credential,
                    ),
                ],
            });

        await this.commandBus.execute(
            node.id,
            command,
        );
    }

    public async syncUsers(
        node: VpnNode,
        credentials: VpnCredential[],
        mode: SyncUsersMode = "reconcile",
    ): Promise<void> {
        const command =
            new SyncUsersCommand({
                inboundTag:
                node.inbound_tag,

                mode,

                users:
                    credentials.map(
                        credential => ({
                            uuid:
                            credential.uuid,

                            email:
                                this.getCredentialEmail(
                                    credential,
                                ),

                            flow:
                                "xtls-rprx-vision",
                        }),
                    ),
            });

        await this.commandBus.execute(
            node.id,
            command,
        );
    }

    private getCredentialEmail(
        credential: VpnCredential,
    ): string {
        return `user_${credential.user_id}`;
    }
}

export default AgentNodeControlService;