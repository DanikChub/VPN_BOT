import {
    AddUsersCommand,
} from "../../../infrastructure/agent/commands/add-users/add-users.command";

import {
    RemoveUsersCommand,
} from "../../../infrastructure/agent/commands/remove-users/remove-users.command";


import type {
    AgentCommandBus,
} from "../../../infrastructure/agent/command-bus/agent-command-bus";


import type {
    NodeControlService,
} from "./node-control.service";


import VpnNode from "../../vpn-nodes/vpn-node.model";

import VpnCredential from "../vpn-credential.model";



class AgentNodeControlService
    implements NodeControlService {


    constructor(
        private readonly commandBus:
        AgentCommandBus,
    ) {}



    async addUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<void> {

        console.log('[NODE CONTROL] command send')
        const command =
            new AddUsersCommand({

                inboundTag:
                node.inbound_tag,

                users:[
                    {
                        uuid:
                        credential.uuid,

                        email:
                            `user_${credential.user_id}`,

                        flow:
                            "xtls-rprx-vision",
                    }
                ],
            });



        await this.commandBus.execute(
            node.id,
            command,
        );

    }



    async removeUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<void> {


        const command =
            new RemoveUsersCommand({

                inboundTag:
                node.inbound_tag,

                emails:[
                    `user_${credential.user_id}`,
                ],

            });



        await this.commandBus.execute(
            node.id,
            command,
        );

    }

}


export default AgentNodeControlService;