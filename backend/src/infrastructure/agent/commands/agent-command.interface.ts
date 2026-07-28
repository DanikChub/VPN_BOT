import {
    AgentCommandType,
} from "@vpn/common";


export interface AgentCommand<TArguments = unknown> {

    readonly type:
        AgentCommandType;


    getArguments():
        TArguments;

}