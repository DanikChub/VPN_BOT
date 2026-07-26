import {
    AgentCommandType,
    type AddUsersCommandArguments,
    type RemoveUsersCommandArguments,
} from "@vpn/common";

import VpnCredential from "../../../modules/vpn/vpn-credential.model";
import VpnNode from "../../../modules/vpn-nodes/vpn-node.model";

import { NodeControlService } from "./node-control.service";

import type {
    CommandService,
} from "./command.service";

class AgentNodeControlService
    implements NodeControlService {
    public constructor(
        private readonly commandService:
        CommandService,
    ) {}

    public async addUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<void> {
        const arguments_: AddUsersCommandArguments = {
            inboundTag:
            node.inbound_tag,

            users: [
                {
                    uuid:
                    credential.uuid,

                    email:
                        `user_${credential.user_id}`,

                    flow:
                        "xtls-rprx-vision",
                },
            ],
        };

        console.log(
            "[VPN COMMAND SEND]",
            {
                nodeId: node.id,
                command:
                AgentCommandType.ADD_USERS,
                arguments: arguments_,
            },
        );

        const result =
            await this.commandService.sendCommand(
                node.id,
                AgentCommandType.ADD_USERS,
                arguments_,
            );

        console.log(
            "[VPN COMMAND RESULT]",
            {
                nodeId: node.id,
                command:
                AgentCommandType.ADD_USERS,
                arguments: arguments_.users,
                result: result.payload.data,
            },
        );

        this.assertCommandSucceeded(
            result,
            AgentCommandType.ADD_USERS,
            node.id,
        );
    }

    public async removeUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<void> {
        const arguments_: RemoveUsersCommandArguments = {
            inboundTag:
            node.inbound_tag,

            emails: [
                `user_${credential.user_id}`,
            ],
        };

        const result =
            await this.commandService.sendCommand(
                node.id,
                AgentCommandType.REMOVE_USERS,
                arguments_,
            );

        this.assertCommandSucceeded(
            result,
            AgentCommandType.REMOVE_USERS,
            node.id,
        );
    }

    private assertCommandSucceeded(
        message: {
            payload: unknown;
        },
        command: AgentCommandType,
        nodeId: number,
    ): void {
        if (
            typeof message.payload !==
            "object" ||
            message.payload === null ||
            Array.isArray(
                message.payload,
            )
        ) {
            throw new Error(
                `Node ${nodeId} returned an invalid result for "${command}"`,
            );
        }

        const payload =
            message.payload as Record<
                string,
                unknown
            >;

        if (
            payload.success === true
        ) {
            return;
        }

        let errorMessage =
            `Node ${nodeId} failed to execute "${command}"`;

        if (
            typeof payload.error ===
            "string"
        ) {
            errorMessage =
                payload.error;
        } else if (
            typeof payload.error ===
            "object" &&
            payload.error !== null &&
            !Array.isArray(
                payload.error,
            )
        ) {
            const error =
                payload.error as Record<
                    string,
                    unknown
                >;

            if (
                typeof error.message ===
                "string"
            ) {
                errorMessage =
                    error.message;
            }
        }

        throw new Error(
            errorMessage,
        );
    }
}

export default AgentNodeControlService;