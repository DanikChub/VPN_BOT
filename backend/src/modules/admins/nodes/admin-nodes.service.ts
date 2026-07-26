import VpnNode from "../../vpn-nodes/vpn-node.model";

import {
    mapNodeToAdminResponse,
} from "./admin-nodes.types";

import type {
    CreateNodeDto,
} from "./admin-nodes.types";
import nodeProvisioningService from "../../../provisioning/provisioning.service";
import {randomBytes} from "node:crypto";





class AdminNodesService {
    async getAll() {
        const nodes = await VpnNode.findAll({
            order: [["id", "ASC"]],
        });

        return nodes.map(
            mapNodeToAdminResponse,
        );
    }


    async getById(
        nodeId: number,
    ) {
        const node = await VpnNode.findByPk(
            nodeId,
        );

        if (!node) {
            return null;
        }

        return mapNodeToAdminResponse(
            node,
        );
    }


    async create(
        dto: CreateNodeDto,
    ) {

        let node =
            await VpnNode.findOne({
                where: {
                    host: dto.host,
                },
            });

        let agentToken =
            node?.agent_token;

        if (!node) {
            agentToken = randomBytes(32).toString("hex");
            node = await VpnNode.create({
                name: dto.name,
                host: dto.host,
                port: dto.port,

                ssh_port: dto.sshPort,
                ssh_user: dto.sshUser,

                inbound_tag:
                    "vless-reality-in",

                is_active: true,
                status: "offline",
                install_status: "pending",

                reality_public_key: "",
                reality_server_name: "",
                reality_short_id: "",
                agent_token: agentToken
            });
        }

        if (!agentToken) {
            throw new Error(
                "Node agent token is missing",
            );
        }


        const provisioningResult = await nodeProvisioningService.install({
            nodeId: node.id,
            host: dto.host,
            sshPort: dto.sshPort,
            sshUser: dto.sshUser,
            sshPassword: dto.sshPassword,
            token: agentToken,
            controlServerUrl:
                process.env.AGENT_CONTROL_SERVER_URL!,

        });

        await node.update({
            reality_public_key: provisioningResult.realityPublicKey,
            reality_short_id: provisioningResult.realityShortId,
            reality_server_name: provisioningResult.serverName,
            port: provisioningResult.port,
            inbound_tag: provisioningResult.inboundTag,
        });

        return mapNodeToAdminResponse(
            node,
        );
    }
}


export default new AdminNodesService();