import {
    AgentCommandType,
} from "@vpn/common";

import {
    SyncUsersCommandArguments,
} from "@vpn/common";


import {AgentCommand} from "../agent-command.interface";

export class SyncUsersCommand

    implements AgentCommand<
        AgentCommandType.SYNC_USERS
    > {
    public readonly type =
        AgentCommandType.SYNC_USERS;

    public constructor(
        private readonly args:
        SyncUsersCommandArguments,
    ) {}


    public getArguments():
        SyncUsersCommandArguments {

        return this.args;
    }
}