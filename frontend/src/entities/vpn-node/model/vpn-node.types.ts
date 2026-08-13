export interface VpnNode {
    id: number;

    name: string;
    host: string;
    port: number;

    reality_public_key: string;
    reality_server_name: string;
    reality_short_id: string;

    inbound_tag: string;

    is_active: boolean;

    status:
        | "online"
        | "offline";

    last_seen_at: string | null;

    cpu_count: number | null;
    cpu_model: string | null;

    memory_total: number | null;
    memory_used: number | null;

    uptime_seconds: number | null;

    install_status:
        | "pending"
        | "installing"
        | "waiting_agent"
        | "ready"
        | "failed";

    agent_token: string | null;

    ssh_port: number;
    ssh_user: string;

    display_name: string | null;

    country_code: string | null;

    sort_order: number;

    role:
        | "exit"
        | "gateway";

    cdn_host: string | null;
}

export interface CreateVpnNodeDto {

    name:string;

    host:string;

    port:number;

    sshPort:number;

    sshUser:string;

    sshPassword:string;

}

export type EditableVpnNodeField =
    | "name"
    | "display_name"
    | "country_code"
    | "sort_order"
    | "is_active";