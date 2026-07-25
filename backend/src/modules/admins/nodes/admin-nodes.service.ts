import vpnNodeService from "../../vpn-nodes/vpn-node.service";

import {
    mapNodeToAdminResponse,
} from "./admin-nodes.types";

import type {
    CreateNodeDto,
} from "./admin-nodes.types";


class AdminNodesService {


    async getAll() {

        const nodes =
            await vpnNodeService.getAll();


        return nodes.map(
            mapNodeToAdminResponse,
        );
    }



    async getById(
        nodeId: number,
    ) {

        const node =
            await vpnNodeService.getById(
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

        const node =
            await vpnNodeService.create({

                name:
                dto.name,

                host:
                dto.host,

                port:
                dto.port,


                ssh_port:
                dto.sshPort,

                ssh_user:
                dto.sshUser,


                reality_public_key:
                dto.realityPublicKey,

                reality_server_name:
                dto.realityServerName,

                reality_short_id:
                dto.realityShortId,

            });


        return mapNodeToAdminResponse(
            node,
        );
    }

}


export default new AdminNodesService();