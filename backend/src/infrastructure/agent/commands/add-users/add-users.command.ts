import {
    AgentCommandType,
} from "@vpn/common";

import type {
    AddUsersCommandArguments,
} from "@vpn/common";

import type {
    AgentCommand,
} from "../agent-command.interface";


export class AddUsersCommand
    implements AgentCommand<
        AgentCommandType.ADD_USERS
    > {

    public readonly type =
        AgentCommandType.ADD_USERS;


    public constructor(
        private readonly args:
        AddUsersCommandArguments,
    ) {}


    public getArguments():
        AddUsersCommandArguments {

        return this.args;
    }
}