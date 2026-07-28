import {
    AgentCommandType,
} from "@vpn/common";


export function assertCommandSucceeded(
    message: {
        payload: unknown;
    },
    command: AgentCommandType,
    nodeId: number,
): void {

    if (
        typeof message.payload !==
        "object" ||
        message.payload === null ||
        Array.isArray(
            message.payload,
        )
    ) {
        throw new Error(
            `Node ${nodeId} returned an invalid result for "${command}"`,
        );
    }


    const payload =
        message.payload as Record<
            string,
            unknown
        >;


    if (
        payload.success === true
    ) {
        return;
    }


    let errorMessage =
        `Node ${nodeId} failed to execute "${command}"`;


    if (
        typeof payload.error ===
        "string"
    ) {
        errorMessage =
            payload.error;

    } else if (
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
            "string"
        ) {
            errorMessage =
                error.message;
        }
    }


    throw new Error(
        errorMessage,
    );
}