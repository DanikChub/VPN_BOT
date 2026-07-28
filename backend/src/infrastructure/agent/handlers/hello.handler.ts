import {
    MessageType,
    type HelloMessage,
} from "@vpn/common";



import VpnNode from "../../../modules/vpn-nodes/vpn-node.model";
import {NodeRegistry} from "../connection/node-registry";
import {AgentMessageContext} from "../transport/message-router";
import {AgentMessageSender} from "../transport/message-sender";



export class HelloHandler {

    public constructor(
        private readonly registry: NodeRegistry,

        private readonly sender: AgentMessageSender,
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

        this.sender.send(
            socket,
            {
                type:
                MessageType.HELLO_ACK,

                requestId:
                message.requestId,

                payload: {
                    nodeId:
                    node.id,

                    accepted:
                        true,
                },
            },
        );

        console.log(
            [
                "Node authenticated:",
                `nodeId=${node.id}`,
                `address=${remoteAddress}`,
                `agentVersion=${agentVersion}`,
                `nodeVersion=${nodeVersion}`,
            ]
                .join(" ")
        );
    };
}