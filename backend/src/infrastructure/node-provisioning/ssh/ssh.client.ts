import { Client } from "ssh2";


interface SSHOptions {

    host: string;

    port: number;

    username: string;

    password: string;
}



export class SSHClient {


    private readonly options: SSHOptions;


    constructor(
        options: SSHOptions,
    ) {

        this.options = options;

    }



    async exec(
        command: string,
    ): Promise<string> {


        return new Promise(
            (
                resolve,
                reject,
            ) => {


                const client =
                    new Client();



                client
                    .on(
                        "ready",
                        () => {


                            client.exec(
                                command,
                                (
                                    error,
                                    stream,
                                ) => {


                                    if (error) {
                                        client.end();
                                        reject(error);
                                        return;
                                    }



                                    let output = "";



                                    stream.on(
                                        "data",
                                        (data) => {

                                            output += data.toString();

                                        },
                                    );



                                    stream.stderr.on(
                                        "data",
                                        (data) => {

                                            console.error(
                                                data.toString(),
                                            );

                                        },
                                    );



                                    stream.on(
                                        "close",
                                        () => {

                                            client.end();

                                            resolve(output);

                                        },
                                    );

                                },
                            );

                        },
                    )
                    .on(
                        "error",
                        reject,
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

                    });


            },
        );
    }

}