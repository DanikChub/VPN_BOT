
import { SSHClient } from "./ssh/ssh.client";
import { ScpClient } from "./ssh/scp.client";

import { NodeInstaller } from "./installers/node.installer";
import { XrayInstaller } from "./installers/xray.installer";
import { AgentInstaller } from "./installers/agent.installer";

import nodeInstallStepService from "../modules/vpn-nodes/node-install-step.service";
import {XrayConfigurator} from "./installers/xray-configurator";


interface InstallOptions {

    nodeId:number;

    host:string;

    port: number;

    sshPort:number;

    sshUser:string;

    sshPassword:string;

    token: string;

    controlServerUrl:string;

}

interface ProvisioningResult {
    port:number;
    inboundTag:string;
    serverName:string;
    realityPublicKey:string;
    realityShortId:string;
}

class NodeProvisioningService {
    async install(
        options:InstallOptions,
    ):Promise<ProvisioningResult>{
        const ssh =
            new SSHClient({
                host: options.host,
                port: options.sshPort,
                username: options.sshUser,
                password: options.sshPassword,
            });
        const scp =
            new ScpClient({
                host: options.host,
                port: options.sshPort,
                username: options.sshUser,
                password: options.sshPassword,
            });


        await ssh.connect();

        try {

            await nodeInstallStepService.run(
                options.nodeId,
                "ssh_connect",
                async()=>{
                    await ssh.exec(
                        "echo SSH_CONNECTED",
                    );
                },

            );

            const nodeInstaller =
                new NodeInstaller(
                    ssh,
                );

            await nodeInstallStepService.run(
                options.nodeId,
                "install_node",
                async()=>{
                    await nodeInstaller.install();
                },
            );

            const xrayInstaller =
                new XrayInstaller(
                    ssh,
                );

            await nodeInstallStepService.run(
                options.nodeId,
                "install_xray",
                async()=>{
                    await xrayInstaller.install();
                },
            );

            const xrayConfigurator =
                new XrayConfigurator(
                    ssh
                )

            const xrayConfig = await nodeInstallStepService.run(
                options.nodeId,
                "configure_xray",
                async()=>{
                    return await xrayConfigurator.configure({
                        port:options.port,
                        inboundTag:"vless-reality-in",
                        serverName:"www.cloudflare.com",
                    });
                },
            );

            const agentInstaller =
                new AgentInstaller(
                    ssh,
                    scp,
                );

            await nodeInstallStepService.run(
                options.nodeId,
                "install_agent",
                async()=>{
                    await agentInstaller.install({
                        nodeId:
                        options.nodeId,
                        token: options.token,
                        controlServerUrl:
                        options.controlServerUrl,
                        heartbeatIntervalMs:
                            10000,

                    });
                },
            );



            await nodeInstallStepService.run(
                options.nodeId,
                "completed",
                async()=>{



                },

            );

            return xrayConfig;

        }
        finally {

            await ssh.close();

        }


    }
}



export default new NodeProvisioningService();