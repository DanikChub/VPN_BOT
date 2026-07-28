import type http from "node:http";
import {AgentWebSocketServer} from "../infrastructure/agent/transport/agent-websocket.server";




let shuttingDown = false;


export function registerShutdown(

    httpServer:
    http.Server,


    agentWebSocketServer:
    AgentWebSocketServer,

) {


    const shutdown =
        async (
            signal:string,
        )=>{


            if(shuttingDown){
                return;
            }


            shuttingDown = true;



            console.log(
                `${signal} received. Shutting down...`,
            );



            try {


                /*
                 *
                 * 1. Закрываем websocket агентов
                 *
                 */

                await agentWebSocketServer.close();



                /*
                 *
                 * 2. Перестаём принимать HTTP
                 *
                 */

                await new Promise<void>(
                    (
                        resolve,
                        reject,
                    )=>{


                        httpServer.close(
                            (error)=>{


                                if(error){

                                    reject(error);

                                    return;

                                }


                                resolve();

                            },
                        );


                    },
                );




                console.log(
                    "Shutdown completed",
                );



                process.exit(0);



            }
            catch(error){


                console.error(
                    "Shutdown failed",
                    error,
                );


                process.exit(1);

            }

        };



    process.once(
        "SIGTERM",
        ()=>{
            void shutdown(
                "SIGTERM",
            );
        },
    );



    process.once(
        "SIGINT",
        ()=>{
            void shutdown(
                "SIGINT",
            );
        },
    );

}