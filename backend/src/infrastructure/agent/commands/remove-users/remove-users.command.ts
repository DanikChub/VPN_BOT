import {
    AgentCommandType,
    type RemoveUsersCommandArguments,
} from "@vpn/common";

import type {
    AgentCommand,
} from "../agent-command.interface";


interface RemoveUsersCommandInput {

    inboundTag: string;

    emails: string[];

}


export class RemoveUsersCommand
    implements AgentCommand<
        AgentCommandType.REMOVE_USERS
    >
{

    public readonly type =
        AgentCommandType.REMOVE_USERS;


    public constructor(
        private readonly args:
        RemoveUsersCommandArguments,
    ) {}


    public getArguments():
        RemoveUsersCommandArguments {

        return this.args;
    }
}