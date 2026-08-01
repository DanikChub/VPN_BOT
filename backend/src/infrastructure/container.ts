import {
    NodeRegistry,
} from "./agent/connection/node-registry";


import {
    CommandService,
} from "./agent/rpc/command.service";


import {
    AgentCommandBus,
} from "./agent/command-bus/agent-command-bus";


import AgentNodeControlService
    from "../modules/vpn/node-control/agent-node-control.service";
import {AgentMessageSender} from "./agent/transport/message-sender";
import {VpnAccessService} from "../modules/vpn/vpn-access.service";
import {NodeSyncService} from "../modules/vpn/node-sync.service";



export const nodeRegistry =
    new NodeRegistry();

export const commandService =
    new CommandService({
        nodeRegistry,
    });

export const commandBus =
    new AgentCommandBus(
        commandService,
    )

export const nodeControlService =
    new AgentNodeControlService(
        commandBus,
    );

export const nodeSyncService =
    new NodeSyncService(
        nodeControlService,
    );

export const vpnAccessService =
    new VpnAccessService(
        nodeControlService,
    );

export const messageSender =
    new AgentMessageSender();