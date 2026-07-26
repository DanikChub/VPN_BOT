import VpnNode from "../../vpn-nodes/vpn-node.model";

import {
    mapNodeToAdminResponse,
} from "./admin-nodes.types";

import type {
    CreateNodeDto,
} from "./admin-nodes.types";
import nodeProvisioningService from "../../../infrastructure/node-provisioning/services/node-provisioning.service";




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
        const node = await VpnNode.create({
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
        });

        await nodeProvisioningService.install(
            node.id,
            {
                sshPassword:
                dto.sshPassword,
            },
        );

        await node.reload();

        return mapNodeToAdminResponse(
            node,
        );
    }
}


export default new AdminNodesService();