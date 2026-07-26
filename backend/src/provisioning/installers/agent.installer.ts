import path from "node:path";

import type { SSHClient } from "../ssh/ssh.client";
import type { ScpClient } from "../ssh/scp.client";


interface InstallAgentOptions {

    nodeId:number;

    token:string;

    controlServerUrl:string;

    heartbeatIntervalMs:number;

}



export class AgentInstaller {


    constructor(

        private readonly ssh:SSHClient,

        private readonly scp:ScpClient,

    ){}




    async install(
        options:InstallAgentOptions,
    ):Promise<void>{


        await this.prepare();


        await this.upload();


        await this.configure(
            options,
        );


        await this.installSystemd();


        await this.start();


        await this.verify();


    }





    private async prepare():Promise<void>{


        await this.ssh.exec(`
set -e


systemctl stop vpn-node-agent || true


rm -rf /opt/vpn-node-agent


mkdir -p /opt/vpn-node-agent

`);

    }




    private async upload():Promise<void>{


        const archive =
            path.resolve(
                "storage/releases/vpn-node-agent.tar.gz",
            );



        await this.scp.upload(

            archive,

            "/tmp/vpn-node-agent.tar.gz",

        );



        await this.ssh.exec(`
set -e


tar -xzf /tmp/vpn-node-agent.tar.gz \
-C /opt/vpn-node-agent


rm -f /tmp/vpn-node-agent.tar.gz

`);

    }





    private async configure(
        options:InstallAgentOptions,
    ):Promise<void>{


        await this.ssh.exec(`
set -e


cat >/etc/vpn-node-agent.env <<'EOF'
NODE_ID=${options.nodeId}
NODE_TOKEN=${options.token}
CONTROL_SERVER_URL=${options.controlServerUrl}
HEARTBEAT_INTERVAL_MS=${options.heartbeatIntervalMs}
LOG_LEVEL=info
EOF

`);

    }




    private async installSystemd():Promise<void>{


        await this.ssh.exec(`
set -e


cat >/etc/systemd/system/vpn-node-agent.service <<'EOF'

[Unit]

Description=VPN Node Agent

After=network-online.target

Wants=network-online.target



[Service]

Type=simple


WorkingDirectory=/opt/vpn-node-agent


EnvironmentFile=/etc/vpn-node-agent.env


ExecStart=/usr/bin/node /opt/vpn-node-agent/dist/index.js


Restart=always

RestartSec=5



[Install]

WantedBy=multi-user.target

EOF


systemctl daemon-reload

`);

    }




    private async start():Promise<void>{


        await this.ssh.exec(`
set -e


systemctl enable vpn-node-agent


systemctl restart vpn-node-agent

`);

    }




    private async verify():Promise<void>{


        const status =
            await this.ssh.exec(`
systemctl is-active vpn-node-agent
`);



        if(
            status.trim() !== "active"
        ){

            const logs =
                await this.ssh.exec(`
journalctl -u vpn-node-agent -n 100 --no-pager || true
`);


            throw new Error(
                "VPN node agent failed to start\n" + logs,
            );

        }


    }


}