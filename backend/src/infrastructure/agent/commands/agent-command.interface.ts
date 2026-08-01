import type {
    AgentCommandArguments,
    AgentCommandContractMap,
} from "@vpn/common";


export interface AgentCommand<
    TType extends keyof AgentCommandContractMap,
> {
    readonly type: TType;

    getArguments():
        AgentCommandArguments<TType>;
}