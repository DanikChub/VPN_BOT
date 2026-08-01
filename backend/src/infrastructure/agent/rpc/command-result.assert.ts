import {
    AgentCommandType,
    type CommandResultMessage,
} from "@vpn/common";


export function getSuccessfulCommandData<TResult>(
    message: CommandResultMessage<TResult>,
    command: AgentCommandType,
    nodeId: number,
): TResult {

    const payload =
        message.payload;


    if (
        typeof payload !==
        "object" ||
        payload === null ||
        Array.isArray(
            payload,
        )
    ) {
        throw new Error(
            `Node ${nodeId} returned an invalid result for "${command}"`,
        );
    }


    if (
        payload.success ===
        true
    ) {
        if (
            !(
                "data" in
                payload
            )
        ) {
            throw new Error(
                `Node ${nodeId} returned success without data for "${command}"`,
            );
        }

        return payload.data;
    }


    let errorMessage =
        `Node ${nodeId} failed to execute "${command}"`;


    if (
        "error" in
        payload &&
        typeof payload.error ===
        "object" &&
        payload.error !== null &&
        !Array.isArray(
            payload.error,
        )
    ) {
        const error =
            payload.error as Record<
                string,
                unknown
            >;


        if (
            typeof error.message ===
            "string" &&
            error.message.trim()
        ) {
            errorMessage =
                error.message;
        }
    }


    throw new Error(
        errorMessage,
    );
}