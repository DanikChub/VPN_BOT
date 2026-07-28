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
    implements AgentCommand<RemoveUsersCommandArguments>
{

    public readonly type =
        AgentCommandType.REMOVE_USERS;


    private readonly arguments:
        RemoveUsersCommandArguments;


    constructor(
        input: RemoveUsersCommandInput,
    ) {

        this.arguments = {
            inboundTag:
            input.inboundTag,

            emails:
            input.emails,
        };

    }


    public getArguments():
        RemoveUsersCommandArguments {

        return this.arguments;

    }

}