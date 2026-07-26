export interface VpnNode {
    id: number;

    name: string;

    host: string;

    port: number;

    status: "online" | "offline";

    lastSeenAt: string | null;

    cpu: {
        count: number | null;
        model: string | null;
    };

    memory: {
        total: number | null;
        used: number | null;
    };

    uptimeSeconds: number | null;
}

export interface CreateVpnNodeDto {

    name:string;

    host:string;

    port:number;

    sshPort:number;

    sshUser:string;

    sshPassword:string;

}