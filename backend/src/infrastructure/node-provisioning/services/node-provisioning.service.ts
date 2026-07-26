import { randomBytes } from "node:crypto";

import VpnNode from "../../../modules/vpn-nodes/vpn-node.model";

import { SSHClient } from "../ssh/ssh.client";
import { ScpClient } from "../ssh/scp.client";

import { XrayInstaller } from "../installers/xray.installer";
import { AgentInstaller } from "../installers/agent.installer";

interface InstallCredentials {
    sshPassword: string;
}

class NodeProvisioningService {

    public async install(
        nodeId: number,
        credentials: InstallCredentials,
    ): Promise<void> {

        const node =
            await VpnNode.findByPk(nodeId);

        if (!node) {
            throw new Error("VPN node not found");
        }

        const token =
            randomBytes(32)
                .toString("hex");

        await node.update({

            install_status:
                "installing",

            agent_token:
            token,

        });

        const ssh =
            new SSHClient({

                host:
                node.host,

                port:
                node.ssh_port,

                username:
                node.ssh_user,

                password:
                credentials.sshPassword,

            });

        const scp =
            new ScpClient({

                host:
                node.host,

                port:
                node.ssh_port,

                username:
                node.ssh_user,

                password:
                credentials.sshPassword,

            });

        try {

            const xray =
                new XrayInstaller(
                    ssh,
                );

            await xray.install();

            const agent =
                new AgentInstaller(
                    ssh,
                    scp,
                );

            await agent.install({

                nodeId:
                node.id,

                token,

                controlServerUrl:
                    process.env.AGENT_CONTROL_SERVER_URL!,

                heartbeatIntervalMs:
                    10000,

            });

            await node.update({

                install_status:
                    "waiting_agent",

            });

        } catch (error) {

            await node.update({

                install_status:
                    "failed",

            });

            throw error;
        }
    }
}

export default new NodeProvisioningService();