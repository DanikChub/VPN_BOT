import {
    AgentCommandType,
    type AddUsersCommandArguments,
} from "@vpn/common";

import type {
    AgentCommand,
} from "../agent-command.interface";


interface AddUsersCommandInput {
    inboundTag: string;

    users: AddUsersCommandArguments["users"];
}


export class AddUsersCommand
    implements AgentCommand<AddUsersCommandArguments>
{

    public readonly type =
        AgentCommandType.ADD_USERS;


    private readonly arguments:
        AddUsersCommandArguments;


    constructor(
        input: AddUsersCommandInput,
    ) {

        this.arguments = {
            inboundTag:
            input.inboundTag,

            users:
            input.users,
        };

    }


    public getArguments():
        AddUsersCommandArguments {

        return this.arguments;

    }

}