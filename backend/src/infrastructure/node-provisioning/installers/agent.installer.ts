import path from "node:path";

import {
    SSHClient,
} from "../ssh/ssh.client";

import {
    ScpClient,
} from "../ssh/scp.client";


interface InstallAgentOptions {

    nodeId:number;

    token:string;

}



export class AgentInstaller {


    constructor(
        private readonly ssh: SSHClient,
        private readonly scp: ScpClient,
    ){}



    async install(
        options: InstallAgentOptions,
    ) {


        await this.ssh.exec(
            `
            mkdir -p /opt/vpn-agent
            `,
        );



        const archivePath =
            path.resolve(
                "storage/releases/vpn-node-agent.tar.gz",
            );



        await this.scp.upload(
            archivePath,
            "/tmp/vpn-node-agent.tar.gz",
        );



        await this.ssh.exec(
            `
            tar -xzf \
            /tmp/vpn-node-agent.tar.gz \
            -C /opt/vpn-agent
            `,
        );



        await this.ssh.exec(
            `
            cat > /opt/vpn-agent/.env <<EOF
            NODE_ID=${options.nodeId}
            NODE_TOKEN=${options.token}
            EOF
            `,
        );



        await this.createService();

    }



    private async createService(){

        await this.ssh.exec(
            `
cat >/etc/systemd/system/vpn-agent.service <<EOF
[Unit]
Description=VPN Node Agent
After=network.target

[Service]
WorkingDirectory=/opt/vpn-agent
ExecStart=/usr/bin/node dist/index.js
Restart=always
EnvironmentFile=/opt/vpn-agent/.env

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable vpn-agent
systemctl restart vpn-agent
            `,
        );

    }

}