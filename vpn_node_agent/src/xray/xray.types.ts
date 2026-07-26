export interface XrayRealityKeyPair {
    privateKey: string;

    publicKey: string;
}

export interface ConfigureXrayInput {
    port: number;

    inboundTag: string;

    serverName: string;
}

export interface ConfigureXrayResult {
    port: number;

    inboundTag: string;

    serverName: string;

    realityPublicKey: string;

    realityShortId: string;

    apiAddress: string;

    configPath: string;
}

export interface XrayServerConfig {
    log: {
        loglevel: string;
    };

    api: {
        tag: string;

        listen: string;

        services: string[];
    };

    stats: Record<string, never>;

    policy: {
        levels: {
            "0": {
                statsUserUplink: boolean;

                statsUserDownlink: boolean;
            };
        };

        system: {
            statsInboundUplink: boolean;

            statsInboundDownlink: boolean;

            statsOutboundUplink: boolean;

            statsOutboundDownlink: boolean;
        };
    };

    inbounds: Array<Record<string, unknown>>;

    outbounds: Array<Record<string, unknown>>;

    routing: {
        domainStrategy: string;

        rules: Array<Record<string, unknown>>;
    };
}