import {
    randomBytes,
} from "node:crypto";

import type {
    SyncUsersMode,
} from "@vpn/common";

import VpnNode
    from "../../vpn-nodes/vpn-node.model";

import {
    EditableNodeField,
    mapNodeToAdminResponse,
} from "./admin-nodes.types";

import type {
    CreateNodeDto,
    SyncNodeUsersResponse,
} from "./admin-nodes.types";

import nodeProvisioningService
    from "../../../provisioning/provisioning.service";

import type {
    NodeSyncService,
} from "../../vpn/node-sync.service";


class AdminNodesService {

    public constructor(
        private readonly nodeSyncService:
            NodeSyncService,
    ) {}


    public async getAll() {
        const nodes =
            await VpnNode.findAll({
                order: [
                    ["id", "ASC"],
                ],
            });

        return nodes.map(
            mapNodeToAdminResponse,
        );
    }


    public async getById(
        nodeId: number,
    ) {
        const node =
            await VpnNode.findByPk(
                nodeId,
            );

        if (!node) {
            return null;
        }

        return mapNodeToAdminResponse(
            node,
        );
    }


    public async create(
        dto: CreateNodeDto,
    ) {
        let node =
            await VpnNode.findOne({
                where: {
                    host:
                    dto.host,
                },
            });

        let agentToken =
            node?.agent_token;

        if (!node) {
            agentToken =
                randomBytes(32)
                    .toString("hex");

            node =
                await VpnNode.create({
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

                    inbound_tag:
                        "vless-reality-in",

                    is_active:
                        true,

                    status:
                        "offline",

                    install_status:
                        "pending",

                    reality_public_key:
                        "",

                    reality_server_name:
                        "",

                    reality_short_id:
                        "",

                    agent_token:
                    agentToken,
                });
        }

        if (!agentToken) {
            throw new Error(
                "Node agent token is missing",
            );
        }
        console.log(process.env.AGENT_CONTROL_SERVER_URL);
        const provisioningResult =
            await nodeProvisioningService.install({
                nodeId:
                node.id,

                host:
                dto.host,

                port:
                dto.port,

                sshPort:
                dto.sshPort,

                sshUser:
                dto.sshUser,

                sshPassword:
                dto.sshPassword,

                token:
                agentToken,

                controlServerUrl:
                    process.env.AGENT_CONTROL_SERVER_URL!,
            });

        await node.update({
            reality_public_key:
            provisioningResult
                .realityPublicKey,

            reality_short_id:
            provisioningResult
                .realityShortId,

            reality_server_name:
            provisioningResult
                .serverName,

            port:
            provisioningResult.port,

            inbound_tag:
            provisioningResult
                .inboundTag,
        });

        return mapNodeToAdminResponse(
            node,
        );
    }


    public async syncUsers(
        nodeId: number,
        mode: SyncUsersMode,
    ): Promise<SyncNodeUsersResponse | null> {
        const node =
            await VpnNode.findByPk(
                nodeId,
            );

        if (!node) {
            return null;
        }

        if (
            node.status !==
            "online"
        ) {
            throw new Error(
                "Node agent is offline",
            );
        }

        await this.nodeSyncService.syncNode(
            node,
            mode,
        );

        return {
            nodeId:
            node.id,

            mode,

            synchronized:
                true,
        };
    }

    public async updateField(
        nodeId: number,
        field: EditableNodeField,
        value: unknown,
    ) {
        const node =
            await VpnNode.findByPk(
                nodeId,
            );

        if (!node) {
            return null;
        }

        const normalizedValue =
            this.normalizeEditableField(
                field,
                value,
            );

        await node.update({
            [field]:
            normalizedValue,
        });

        return mapNodeToAdminResponse(
            node,
        );
    }

    private normalizeEditableField(
        field: EditableNodeField,
        value: unknown,
    ) {
        switch (field) {

            case "name":
            case "display_name": {
                if (
                    value !== null &&
                    typeof value !== "string"
                ) {
                    throw new Error(
                        `Invalid value for ${field}`,
                    );
                }

                return value;
            }


            case "country_code": {
                if (value === null) {
                    return null;
                }

                if (
                    typeof value !== "string" ||
                    !/^[A-Za-z]{2}$/.test(
                        value,
                    )
                ) {
                    throw new Error(
                        "Invalid country_code",
                    );
                }

                return value.toUpperCase();
            }


            case "sort_order": {
                if (
                    typeof value !== "number" ||
                    !Number.isInteger(value)
                ) {
                    throw new Error(
                        "Invalid sort_order",
                    );
                }

                return value;
            }


            case "is_active": {
                if (
                    typeof value !== "boolean"
                ) {
                    throw new Error(
                        "Invalid is_active",
                    );
                }

                return value;
            }


            default:
                throw new Error(
                    `Field "${field}" is not editable`,
                );
        }
    }
}


export default AdminNodesService;