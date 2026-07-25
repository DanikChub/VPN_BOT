import type { SSHClient } from "../ssh/ssh.client";


export class XrayInstaller {


    constructor(
        private readonly ssh: SSHClient,
    ) {}



    async install(): Promise<void> {


        await this.ssh.exec(
            `
            apt update
            `,
        );


        await this.ssh.exec(
            `
            apt install -y curl unzip
            `,
        );



        await this.ssh.exec(
            `
            bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)"
            `,
        );


    }

}