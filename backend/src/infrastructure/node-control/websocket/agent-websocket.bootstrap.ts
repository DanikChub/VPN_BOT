import {
    MessageType,
    type HelloMessage,
    type HeartbeatMessage,
    type CommandResultMessage,
} from "@vpn/common";


import {
    AgentWebSocketServer,
} from "./agent-websocket.server";


import {
    HelloHandler,
} from "../handlers/hello.handler";


import {
    HeartbeatHandler,
} from "../handlers/heartbeat.handler";


import {
    CommandResultHandler,
} from "../handlers/command-result.handler";


import {
    nodeRegistry,
    commandService,
} from "../../container";



export function setupAgentWebSocket(
    httpServer: any,
) {


    const server =
        new AgentWebSocketServer({

            httpServer,

            nodeRegistry,

            path:
                "/ws/agent",

        });



    const helloHandler =
        new HelloHandler(
            nodeRegistry,
            commandService,
        );



    const heartbeatHandler =
        new HeartbeatHandler({

            nodeRegistry,

        });



    const commandResultHandler =
        new CommandResultHandler({

            nodeRegistry,

            commandService,

        });



    const router =
        server.getRouter();



    router.register<HelloMessage>(

        MessageType.HELLO,

        helloHandler.handle,

    );



    router.register<HeartbeatMessage>(

        MessageType.HEARTBEAT,

        heartbeatHandler.handle,

    );



    router.register<CommandResultMessage>(

        MessageType.COMMAND_RESULT,

        commandResultHandler.handle,

    );



    return server;

}