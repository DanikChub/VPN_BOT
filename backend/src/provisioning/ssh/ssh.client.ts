import { Client } from "ssh2";


interface SSHOptions {

    host: string;

    port: number;

    username: string;

    password: string;

}



export class SSHClient {


    private readonly options: SSHOptions;


    private client: Client | null = null;


    private connected = false;



    constructor(
        options: SSHOptions,
    ) {

        this.options = options;

    }





    async connect(): Promise<void> {


        if(this.connected && this.client){
            return;
        }



        this.client =
            new Client();



        await new Promise<void>(
            (
                resolve,
                reject,
            )=>{


                const timeout =
                    setTimeout(
                        ()=>{

                            reject(
                                new Error(
                                    "SSH connection timeout",
                                ),
                            );

                        },
                        15000,
                    );



                this.client!
                    .once(
                        "ready",
                        ()=>{

                            clearTimeout(timeout);


                            this.connected = true;


                            resolve();

                        },
                    )

                    .once(
                        "error",
                        (error)=>{

                            clearTimeout(timeout);


                            this.client = null;


                            reject(error);

                        },
                    )

                    .connect({

                        host:
                        this.options.host,


                        port:
                        this.options.port,


                        username:
                        this.options.username,


                        password:
                        this.options.password,


                        keepaliveInterval:
                            10000,


                        keepaliveCountMax:
                            3,

                    });


            },
        );

    }






    async exec(
        command:string,
    ):Promise<string>{


        if(
            !this.client ||
            !this.connected
        ){

            throw new Error(
                "SSH client is not connected",
            );

        }




        return new Promise<string>(
            (
                resolve,
                reject,
            )=>{


                this.client!.exec(
                    command,
                    (
                        error,
                        stream,
                    )=>{


                        if(error){

                            reject(error);

                            return;

                        }



                        let stdout = "";

                        let stderr = "";



                        stream.on(
                            "data",
                            (
                                data:Buffer,
                            )=>{

                                stdout +=
                                    data.toString();

                            },
                        );



                        stream.stderr.on(
                            "data",
                            (
                                data:Buffer,
                            )=>{

                                stderr +=
                                    data.toString();

                            },
                        );



                        stream.on(
                            "close",
                            (
                                code:number,
                            )=>{


                                if(code !== 0){

                                    reject(
                                        new Error(
                                            stderr ||
                                            `SSH command failed: ${code}`,
                                        ),
                                    );

                                    return;

                                }


                                resolve(
                                    stdout,
                                );


                            },
                        );


                    },
                );


            },
        );

    }






    async close():Promise<void>{


        if(!this.client){
            return;
        }


        this.client.end();


        this.client = null;


        this.connected = false;

    }

}