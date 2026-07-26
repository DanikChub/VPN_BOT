import {
    setupAgentWebSocket,
} from "../infrastructure/node-control/websocket/agent-websocket.bootstrap";


export function startAgentWebSocket(
    httpServer:any,
){

    return setupAgentWebSocket(
        httpServer,
    );

}