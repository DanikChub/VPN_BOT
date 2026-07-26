import "dotenv/config";

import {
    initDatabase,
} from "./database";

import {
    startJobs,
} from "./jobs";

import {
    createHttpServer,
} from "./bootstrap/http.bootstrap";

import {
    startAgentWebSocket,
} from "./bootstrap/websocket.bootstrap";
import {registerShutdown} from "./bootstrap/shutdown.bootstrap";



const start = async (): Promise<void> => {

    await initDatabase();


    startJobs();


    const httpServer =
        createHttpServer();


    const agentWebSocketServer =
        startAgentWebSocket(
            httpServer,
        );


    registerShutdown(
        httpServer,
        agentWebSocketServer,
    );


    httpServer.listen(
        Number(process.env.PORT) || 5000,

        () => {

            console.log(
                `Server started on ${process.env.PORT || 5000}`,
            );

        },
    );

};



void start();