import AdminNodesService
    from "./admin-nodes.service";

import {
    NodeSyncService,
} from "../../vpn/node-sync.service";

import AgentNodeControlService
    from "../../vpn/node-control/agent-node-control.service";

import {commandBus} from "../../../infrastructure/container";


const agentNodeControlService =
    new AgentNodeControlService(
        commandBus,
    );

const nodeSyncService =
    new NodeSyncService(
        agentNodeControlService,
    );

const adminNodesService =
    new AdminNodesService(
        nodeSyncService,
    );


export default adminNodesService;