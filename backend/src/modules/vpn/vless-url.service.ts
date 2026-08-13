import VpnCredential from "./vpn-credential.model";
import VpnNode from "../vpn-nodes/vpn-node.model";


class VlessUrlService {

    build(
        credential: VpnCredential,
        node: VpnNode,
    ) {
        if (node.role === "gateway") {
            return this.buildGatewayConfig(
                credential,
                node,
            );
        }

        return this.buildExitConfig(
            credential,
            node,
        );
    }


    private buildExitConfig(
        credential: VpnCredential,
        node: VpnNode,
    ) {
        return {
            dns: {
                hosts: {
                    "domain:googleapis.cn":
                        "googleapis.com",
                },

                queryStrategy:
                    "UseIPv4",

                servers: [
                    "1.1.1.1",

                    {
                        address:
                            "1.1.1.1",

                        domains: [],

                        port:
                            53,
                    },

                    {
                        address:
                            "8.8.8.8",

                        domains: [],

                        port:
                            53,
                    },
                ],
            },

            inbounds: [
                {
                    listen:
                        "127.0.0.1",

                    port:
                        10808,

                    protocol:
                        "socks",

                    settings: {
                        auth:
                            "noauth",

                        udp:
                            true,

                        userLevel:
                            8,
                    },

                    sniffing: {
                        destOverride: [
                            "http",
                            "tls",
                            "quic",
                        ],

                        enabled:
                            true,
                    },

                    tag:
                        "socks",
                },

                {
                    listen:
                        "127.0.0.1",

                    port:
                        11111,

                    protocol:
                        "dokodemo-door",

                    settings: {
                        address:
                            "127.0.0.1",
                    },

                    tag:
                        "metrics_in",
                },
            ],

            log: {
                loglevel:
                    "debug",
            },

            metrics: {
                tag:
                    "metrics_out",
            },

            outbounds: [
                {
                    mux: {
                        concurrency:
                            -1,

                        enabled:
                            false,

                        xudpConcurrency:
                            8,

                        xudpProxyUDP443:
                            "",
                    },

                    protocol:
                        "vless",

                    settings: {
                        vnext: [
                            {
                                address:
                                node.host,

                                port:
                                node.port,

                                users: [
                                    {
                                        encryption:
                                            "none",

                                        flow:
                                            "xtls-rprx-vision",

                                        id:
                                        credential.uuid,

                                        level:
                                            8,

                                        security:
                                            "auto",
                                    },
                                ],
                            },
                        ],
                    },

                    streamSettings: {
                        network:
                            "tcp",

                        realitySettings: {
                            allowInsecure:
                                false,

                            fingerprint:
                                "firefox",

                            publicKey:
                            node.reality_public_key,

                            serverName:
                            node.reality_server_name,

                            shortId:
                            node.reality_short_id,

                            show:
                                false,

                            spiderX:
                                "/",
                        },

                        security:
                            "reality",

                        tcpSettings: {
                            header: {
                                type:
                                    "none",
                            },
                        },
                    },

                    tag:
                        "proxy",
                },

                {
                    protocol:
                        "freedom",

                    settings: {
                        domainStrategy:
                            "UseIP",
                    },

                    tag:
                        "direct",
                },

                {
                    protocol:
                        "blackhole",

                    settings: {
                        response: {
                            type:
                                "http",
                        },
                    },

                    tag:
                        "block",
                },
            ],

            policy: {
                levels: {
                    "0": {
                        statsUserDownlink:
                            true,

                        statsUserUplink:
                            true,
                    },

                    "8": {
                        connIdle:
                            300,

                        downlinkOnly:
                            1,

                        handshake:
                            4,

                        uplinkOnly:
                            1,
                    },
                },

                system: {
                    statsInboundDownlink:
                        true,

                    statsInboundUplink:
                        true,

                    statsOutboundDownlink:
                        true,

                    statsOutboundUplink:
                        true,
                },
            },

            remarks:
                this.buildHappRemarks(
                    node,
                ),

            routing: {
                domainStrategy:
                    "IPIfNonMatch",

                rules: [
                    {
                        inboundTag: [
                            "metrics_in",
                        ],

                        outboundTag:
                            "metrics_out",
                    },

                    {
                        inboundTag: [
                            "socks",
                        ],

                        outboundTag:
                            "proxy",

                        port:
                            "53",
                    },

                    {
                        ip: [
                            "1.1.1.1",
                        ],

                        outboundTag:
                            "proxy",

                        port:
                            "53",
                    },

                    {
                        ip: [
                            "8.8.8.8",
                        ],

                        outboundTag:
                            "direct",

                        port:
                            "53",
                    },
                ],
            },

            stats: {},
        };
    }


    private buildGatewayConfig(
        credential: VpnCredential,
        node: VpnNode,
    ) {
        if (!node.cdn_host) {
            throw new Error(
                `Gateway node ${node.id} has no cdn_host`,
            );
        }

        return {
            api: {
                listen:
                    "[::1]:10085",

                services: [
                    "StatsService",
                ],

                tag:
                    "api",
            },

            dns: {
                hosts: {
                    "domain:googleapis.cn":
                        "googleapis.com",
                },

                queryStrategy:
                    "UseIP",

                servers: [
                    "1.1.1.1",

                    {
                        address:
                            "1.1.1.1",

                        domains: [],

                        port:
                            53,
                    },

                    {
                        address:
                            "8.8.8.8",

                        domains: [],

                        port:
                            53,
                    },
                ],
            },

            inbounds: [
                {
                    listen:
                        "127.0.0.1",

                    port:
                        10808,

                    protocol:
                        "socks",

                    settings: {
                        auth:
                            "noauth",

                        udp:
                            true,

                        userLevel:
                            8,
                    },

                    sniffing: {
                        destOverride: [
                            "http",
                            "tls",
                            "quic",
                        ],

                        enabled:
                            true,
                    },

                    tag:
                        "socks",
                },
            ],

            log: {
                dnsLog:
                    true,

                loglevel:
                    "none",
            },

            meta:
                null,

            outbounds: [
                {
                    mux: {
                        concurrency:
                            -1,

                        enabled:
                            false,

                        xudpConcurrency:
                            8,

                        xudpProxyUDP443:
                            "",
                    },

                    protocol:
                        "vless",

                    settings: {
                        vnext: [
                            {
                                address:
                                node.cdn_host,

                                port:
                                    443,

                                users: [
                                    {
                                        encryption:
                                            "none",

                                        flow:
                                            "",

                                        id:
                                        credential.uuid,

                                        level:
                                            8,

                                        security:
                                            "auto",
                                    },
                                ],
                            },
                        ],
                    },

                    streamSettings: {
                        network:
                            "xhttp",

                        security:
                            "tls",

                        xhttpSettings: {
                            extra: {
                                mode:
                                    "packet-up",

                                scMaxBufferedPosts:
                                    30,

                                scMaxEachPostBytes:
                                    1000000,

                                scMinPostsIntervalMs:
                                    30,

                                uplinkHTTPMethod:
                                    "OPTIONS",

                                xPaddingHeader:
                                    "X-Cache",

                                xPaddingKey:
                                    "dc",

                                xPaddingMethod:
                                    "tokenish",

                                xPaddingObfsMode:
                                    true,

                                xPaddingPlacement:
                                    "queryInHeader",
                            },

                            host:
                            node.cdn_host,

                            mode:
                                "packet-up",

                            path:
                                "/api-test",

                            scMaxConcurrentPosts:
                                10,

                            scMaxEachPostBytes:
                                1000000,

                            scMinPostsIntervalMs:
                                "30",
                        },
                    },

                    tag:
                        "proxy",
                },

                {
                    protocol:
                        "freedom",

                    tag:
                        "direct",
                },

                {
                    protocol:
                        "blackhole",

                    tag:
                        "block",
                },
            ],

            policy: {
                levels: {
                    "8": {
                        connIdle:
                            300,

                        downlinkOnly:
                            1,

                        handshake:
                            4,

                        uplinkOnly:
                            1,
                    },
                },

                system: {
                    statsOutboundDownlink:
                        true,

                    statsOutboundUplink:
                        true,
                },
            },

            remarks:
                this.buildHappRemarks(
                    node,
                ),

            routing: {
                domainStrategy:
                    "IPIfNonMatch",

                rules: [
                    {
                        ip: [
                            "1.1.1.1",
                        ],

                        outboundTag:
                            "proxy",

                        port:
                            "53",
                    },

                    {
                        ip: [
                            "8.8.8.8",
                        ],

                        outboundTag:
                            "direct",

                        port:
                            "53",
                    },

                    {
                        ip: [
                            "10.0.0.0/8",
                            "172.16.0.0/12",
                            "192.168.0.0/16",
                            "169.254.0.0/16",
                            "224.0.0.0/4",
                            "255.255.255.255",
                        ],

                        outboundTag:
                            "direct",
                    },
                ],
            },

            stats: {},
        };
    }

    private buildHappRemarks(
        node: VpnNode,
    ): string {
        const name =
            node.display_name ??
            node.name;

        const flag =
            this.countryCodeToFlag(
                node.country_code,
            );

        return flag
            ? `${flag} ${name}`
            : name;
    }


    private countryCodeToFlag(
        countryCode: string | null,
    ): string | null {
        if (
            !countryCode ||
            !/^[A-Za-z]{2}$/.test(
                countryCode,
            )
        ) {
            return null;
        }

        return countryCode
            .toUpperCase()
            .split("")
            .map(
                (char) =>
                    String.fromCodePoint(
                        127397 +
                        char.charCodeAt(0),
                    ),
            )
            .join("");
    }
}


export default new VlessUrlService();