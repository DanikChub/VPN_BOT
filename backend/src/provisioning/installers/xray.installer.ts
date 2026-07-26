import type { SSHClient } from "../ssh/ssh.client";


export class XrayInstaller {


    constructor(
        private readonly ssh: SSHClient,
    ){}



    async install():Promise<void>{


        await this.prepare();

        const installed =
            await this.isInstalled();


        if(!installed){

            await this.installXray();

        }


        await this.installXray();


        await this.verify();


    }




    private async prepare():Promise<void>{


        await this.ssh.exec(`
set -e


export DEBIAN_FRONTEND=noninteractive


apt-get update


apt-get install -y \
curl \
unzip \
ca-certificates

`);

    }





    private async installXray():Promise<void>{


        await this.ssh.exec(`
set -e


bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)"


`);

    }


    private async isInstalled():Promise<boolean>{


        const result =
            await this.ssh.exec(`
command -v xray || true
`);


        return result.trim().length > 0;

    }


    private async verify():Promise<void>{


        const result =
            await this.ssh.exec(`
set -e


xray version

`);



        if(
            !result.includes("Xray")
        ){

            throw new Error(
                "Xray verification failed",
            );

        }


    }


}