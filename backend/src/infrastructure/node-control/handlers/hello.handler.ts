import {
    MessageType,
    AgentCommandType,
    type HelloMessage,
} from "@vpn/common";

import type {
    AgentMessageContext,
} from "../router/message-router";

import type {
    NodeRegistry,
} from "../registry/node-registry";

import VpnNode from "../../../modules/vpn-nodes/vpn-node.model";
import {CommandService} from "../services/command.service";

export class HelloHandler {
    public constructor(
        private readonly registry:
        NodeRegistry,

        private readonly commandService:
        CommandService,
    ) {}

    public handle = async (
        context: AgentMessageContext<HelloMessage>,
    ): Promise<void> => {
        const {
            socket,
            message,
            remoteAddress,
        } = context;

        const {
            nodeId,
            token,
            agentVersion,
            nodeVersion,
            platform,
            architecture,
        } = message.payload;

        const node =
            await VpnNode.findByPk(
                nodeId,
            );

        if (!node) {
            socket.close(
                4001,
                "Unknown node",
            );

            return;
        }

        if (
            !node.agent_token ||
            node.agent_token !== token
        ) {
            socket.close(
                4002,
                "Invalid token",
            );

            return;
        }

        const existingAgent =
            this.registry.findBySocket(
                socket,
            );

        if (existingAgent) {
            socket.close(
                4003,
                "Agent already authenticated",
            );

            return;
        }

        this.registry.register({
            nodeId: node.id,
            socket,
            remoteAddress,
            agentVersion,
            nodeVersion,
            platform,
            architecture,
        });

        await node.update({

            status: "online",
            last_seen_at: new Date(),
        });

        socket.send(
            JSON.stringify({
                type:
                MessageType.HELLO_ACK,

                requestId:
                message.requestId,

                payload: {
                    nodeId: node.id,
                    accepted: true,
                },
            }),
        );

        if (node.install_status !== "ready") {
            setImmediate(() => {
                void this.configureXray(
                    node,
                );
            });
        }

        console.log(
            [
                "Node authenticated:",
                `nodeId=${node.id}`,
                `address=${remoteAddress}`,
                `agentVersion=${agentVersion}`,
                `nodeVersion=${nodeVersion}`,
            ].join(" "),
        );
    };

    private async configureXray(
        node: VpnNode,
    ): Promise<void> {
        try {
            console.log(
                `Configuring Xray on node ${node.id}`,
            );

            const result =
                await this.commandService.sendCommand(
                    node.id,

                    AgentCommandType.CONFIGURE_XRAY,

                    {
                        port:
                            443,

                        inboundTag:
                            "vless-reality-in",

                        serverName:
                            "www.microsoft.com",
                    },
                );

            console.log(
                "Xray configuration result:",
                JSON.stringify(
                    result,
                    null,
                    2,
                ),
            );

            /*
             * Пока только для первой проверки.
             * После того как увидим точную структуру
             * CommandResultMessage, сохраним:
             *
             * realityPublicKey
             * realityShortId
             * port
             * inboundTag
             */

            await node.update({
                install_status:
                    "ready",

                status:
                    "online",

                last_seen_at:
                    new Date(),
            });

            console.log(
                `Xray configured on node ${node.id}`,
            );
        } catch (error) {
            console.error(
                `Failed to configure Xray on node ${node.id}`,
                error,
            );

            await node.update({
                install_status:
                    "failed",
            });
        }
    }
}