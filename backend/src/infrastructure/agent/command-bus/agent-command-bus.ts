import type {
    AgentCommandContractMap,
    AgentCommandResult,
} from "@vpn/common";

import type {
    AgentCommand,
} from "../commands/agent-command.interface";

import {
    CommandService,
} from "../rpc/command.service";

import {
    getSuccessfulCommandData,
} from "../rpc/command-result.assert";


export class AgentCommandBus {

    public constructor(
        private readonly commandService:
        CommandService,
    ) {}


    public async execute<
        TType extends keyof AgentCommandContractMap,
    >(
        nodeId: number,
        command: AgentCommand<TType>,
    ): Promise<AgentCommandResult<TType>> {

        const startedAt =
            Date.now();


        console.log(
            "[AGENT_COMMAND] Sending",
            {
                nodeId,

                command:
                command.type,

                arguments:
                    command.getArguments(),
            },
        );


        try {
            const message =
                await this.commandService
                    .sendCommand<
                        AgentCommandResult<TType>
                    >(
                        nodeId,
                        command.type,
                        command.getArguments(),
                    );


            const data =
                getSuccessfulCommandData(
                    message,
                    command.type,
                    nodeId,
                );


            console.log(
                "[AGENT_COMMAND] Succeeded",
                {
                    nodeId,

                    command:
                    command.type,

                    durationMs:
                        Date.now() -
                        startedAt,

                    result:
                    data,
                },
            );


            return data;
        } catch (error) {
            console.error(
                "[AGENT_COMMAND] Failed",
                {
                    nodeId,

                    command:
                    command.type,

                    durationMs:
                        Date.now() -
                        startedAt,

                    error:
                        error instanceof Error
                            ? {
                                name:
                                error.name,

                                message:
                                error.message,

                                stack:
                                error.stack,
                            }
                            : error,
                },
            );


            throw error;
        }
    }
}