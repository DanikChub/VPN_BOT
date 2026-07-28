import { WebSocket } from "ws";


export class AgentMessageSender {

    public send(
        socket: WebSocket,
        message: unknown,
    ): boolean {

        if (
            socket.readyState !==
            WebSocket.OPEN
        ) {
            return false;
        }


        try {

            socket.send(
                JSON.stringify(message),
            );

            return true;

        } catch (error) {

            console.error(
                "Failed to send websocket message",
                error,
            );

            return false;
        }
    }


    public sendError(
        socket: WebSocket,
        code: string,
        message: string,
        requestId?: string,
    ): boolean {

        return this.send(
            socket,
            {
                type: "ERROR",

                requestId,

                payload: {
                    code,
                    message,
                },
            },
        );
    }

}