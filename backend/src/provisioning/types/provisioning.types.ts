export interface ProvisioningOptions {

    nodeId:number;

    host:string;

    sshPort:number;

    sshUser:string;

    sshPassword:string;

    controlServerUrl: string;

    agentToken:string;

}

interface InstallAgentOptions {
    nodeId: number;

    host: string;

    sshPort: number;
    sshUser: string;
    sshPassword: string;

    token: string;

    controlServerUrl: string;
}