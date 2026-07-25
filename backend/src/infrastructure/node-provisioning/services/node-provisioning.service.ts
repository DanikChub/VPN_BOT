import VpnNode from "../../../modules/vpn-nodes/vpn-node.model";

import {
    SSHClient,
} from "../ssh/ssh.client";

import {
    XrayInstaller,
} from "../installers/xray.installer";


interface InstallCredentials {

    sshPassword:string;

}


class NodeProvisioningService {


    async install(
        nodeId:number,
        credentials:InstallCredentials,
    ):Promise<void>{


        const node =
            await VpnNode.findByPk(
                nodeId,
            );


        if(!node){
            throw new Error(
                "VPN node not found",
            );
        }



        await node.update({

            install_status:
                "installing",

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



        try {


            const xray =
                new XrayInstaller(
                    ssh,
                );


            await xray.install();



            await node.update({

                install_status:
                    "waiting_agent",

            });


        } catch(error){


            await node.update({

                install_status:
                    "failed",

            });


            throw error;

        }

    }

}


export default new NodeProvisioningService();