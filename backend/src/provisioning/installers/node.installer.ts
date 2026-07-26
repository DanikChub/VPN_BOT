import type { SSHClient } from "../ssh/ssh.client";


export class NodeInstaller {

    constructor(
        private readonly ssh: SSHClient,
    ) {}



    async install(): Promise<void> {

        await this.prepare();

        const installed =
            await this.isInstalled();


        if(!installed){

            await this.installNode();

        }

        await this.verify();

    }

    private async prepare():Promise<void>{


        await this.ssh.exec(`
set -e


export DEBIAN_FRONTEND=noninteractive


apt-get update


apt-get install -y \
curl \
ca-certificates \
gnupg

`);

    }





    private async isInstalled():Promise<boolean>{


        const result =
            await this.ssh.exec(`
command -v node || true
`);


        return result.trim().length > 0;

    }



    private async installNode(): Promise<void> {

        await this.ssh.exec(`
set -e

export DEBIAN_FRONTEND=noninteractive


apt-get update


apt-get install -y \
curl \
ca-certificates \
gnupg



if ! command -v node >/dev/null 2>&1; then


    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -


    apt-get install -y nodejs


fi

`);

    }



    private async verify(): Promise<void> {

        const result =
            await this.ssh.exec(`
set -e

node --version

npm --version
`);



        if(!result.includes("v")) {

            throw new Error(
                "Node.js verification failed",
            );

        }

    }

}