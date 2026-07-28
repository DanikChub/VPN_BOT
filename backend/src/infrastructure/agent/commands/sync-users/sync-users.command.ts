import {
    AgentCommandType,
    type SyncUsersCommandArguments,
} from "@vpn/common";

import type {
    AgentCommand,
} from "../agent-command.interface";

export class SyncUsersCommand
    implements AgentCommand<SyncUsersCommandArguments> {

    public readonly type =
        AgentCommandType.SYNC_USERS;

    public constructor(
        private readonly arguments_:
        SyncUsersCommandArguments,
    ) {}

    public getArguments():
        SyncUsersCommandArguments {

        return this.arguments_;
    }
}