import Client from "ssh2-sftp-client";


interface ScpOptions {
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
}


export class ScpClient {

    private readonly options: ScpOptions;


    constructor(
        options: ScpOptions,
    ) {
        this.options = options;
    }


    async upload(
        localPath: string,
        remotePath: string,
    ): Promise<void> {

        const client =
            new Client();


        try {

            await client.connect({

                host:
                this.options.host,

                port:
                this.options.port,

                username:
                this.options.username,

                password:
                this.options.password,

                privateKey:
                this.options.privateKey,

            });


            await client.put(
                localPath,
                remotePath,
            );


        } finally {

            await client.end();

        }
    }
}