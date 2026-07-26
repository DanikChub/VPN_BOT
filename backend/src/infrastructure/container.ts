import {
    NodeRegistry,
} from "./node-control/registry/node-registry";

import {
    CommandService,
} from "./node-control/services/command.service";

import AgentNodeControlService from "./node-control/services/agent-node-control.service";

import {
    VpnAccessService,
} from "../modules/vpn/vpn-access.service";

export const nodeRegistry =
    new NodeRegistry();

export const commandService =
    new CommandService({
        nodeRegistry,
    });

export const nodeControlService =
    new AgentNodeControlService(
        commandService,
    );

export const vpnAccessService =
    new VpnAccessService(
        nodeControlService,
    );