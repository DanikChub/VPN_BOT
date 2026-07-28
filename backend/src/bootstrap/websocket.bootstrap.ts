import {setupAgentWebSocket} from "../infrastructure/agent/transport/setup-agent-websocket";


export function startAgentWebSocket(
    httpServer:any,
){

    return setupAgentWebSocket(
        httpServer,
    );

}