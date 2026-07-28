import type {
    AgentCommand,
} from "../commands/agent-command.interface";


import {
    CommandService,
} from "../rpc/command.service";


import {
    assertCommandSucceeded,
} from "../rpc/command-result.assert";



export class AgentCommandBus {


    constructor(
        private readonly commandService:
        CommandService,
    ) {}



    async execute<TArguments>(
        nodeId: number,
        command:
        AgentCommand<TArguments>,
    ): Promise<void> {


        const result =
            await this.commandService.sendCommand(
                nodeId,
                command.type,
                command.getArguments(),
            );



        assertCommandSucceeded(
            result,
            command.type,
            nodeId,
        );

    }

}