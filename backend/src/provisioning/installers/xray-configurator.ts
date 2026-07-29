import {
    randomBytes,
} from "node:crypto";

import type {
    SSHClient,
} from "../ssh/ssh.client";


interface ConfigureXrayOptions {
    port: number;

    inboundTag: string;

    serverName: string;
}


export interface XrayConfigurationResult {

    port: number;

    inboundTag: string;

    serverName: string;

    realityPublicKey: string;

    realityShortId: string;

}



export class XrayConfigurator {


    constructor(
        private readonly ssh: SSHClient,
    ) {}



    async configure(
        options: ConfigureXrayOptions,
    ): Promise<XrayConfigurationResult> {


        const keys =
            await this.generateKeys();



        const shortId =
            randomBytes(8)
                .toString("hex");



        const config = {

            log: {
                loglevel:
                    "warning",
            },

            api: {
                tag: "api",
                listen:  "127.0.0.1:10085",
                services: [
                    "HandlerService",
                    "StatsService",
                ],
            },
            stats: {},
            policy: {
                levels: {
                    "0": {
                        statsUserUplink:
                            true,
                        statsUserDownlink:
                            true,
                    },
                },

                system: {
                    statsInboundUplink:
                        true,
                    statsInboundDownlink:
                        true,
                    statsOutboundUplink:
                        true,
                    statsOutboundDownlink:
                        true,
                },
            },

            inbounds: [
                {
                    tag:
                    options.inboundTag,
                    listen:
                        "0.0.0.0",
                    port:
                    options.port,
                    protocol:
                        "vless",
                    settings: {
                        clients: [],
                        decryption:
                            "none",
                    },
                    streamSettings: {
                        network:
                            "tcp",
                        security:
                            "reality",
                        realitySettings: {
                            show:
                                false,
                            dest:
                                `${options.serverName}:443`,
                            serverNames: [
                                options.serverName,
                            ],
                            privateKey:
                            keys.privateKey,
                            shortIds: [
                                shortId,
                            ],
                        },
                    },
                },
            ],
            outbounds: [
                {
                    protocol: "freedom",
                },
            ],
            routing: {
                domainStrategy:
                    "AsIs",
                rules: [
                    {
                        type:
                            "field",

                        inboundTag: [
                            "api",
                        ],
                        outboundTag:
                            "api",
                    },
                ],
            },
        };



        await this.writeConfig(
            config,
        );



        await this.restart();



        await this.verify();



        await this.verifyApi();



        return {

            port:
            options.port,


            inboundTag:
            options.inboundTag,


            serverName:
            options.serverName,


            realityPublicKey:
            keys.publicKey,


            realityShortId:
            shortId,
        };

    }





    private async generateKeys() {


        const result =
            await this.ssh.exec(`
xray x25519
`);



        const privateKey =
            this.extract(
                result,
                "PrivateKey",
            );



        const publicKey =
            this.extract(
                result,
                "Password (PublicKey)",
            );



        if (
            !privateKey ||
            !publicKey
        ) {

            throw new Error(
                "Failed to generate Reality keys\n" +
                result,
            );
        }



        return {

            privateKey,

            publicKey,
        };

    }





    private async writeConfig(
        config: unknown,
    ) {


        const json =
            JSON.stringify(
                config,
                null,
                2,
            );



        await this.ssh.exec(`
mkdir -p /usr/local/etc/xray
`);



        await this.ssh.exec(`
cat > /usr/local/etc/xray/config.json <<'EOF'
${json}
EOF
`);



        await this.ssh.exec(`
xray run -test -config /usr/local/etc/xray/config.json
`);

    }





    private async restart() {


        await this.ssh.exec(`
systemctl restart xray
`);

    }





    private async verify() {


        const status =
            await this.ssh.exec(`
systemctl is-active xray
`);



        if (
            status.trim() !==
            "active"
        ) {


            const logs =
                await this.ssh.exec(`
journalctl -u xray -n 100 --no-pager
`);



            throw new Error(
                `Xray failed to start:\n${logs}`,
            );

        }

    }

    private async verifyApi() {


        const result =
            await this.ssh.exec(`
ss -lnt | grep 10085 || true
`);



        if (
            !result.includes("10085")
        ) {

            const logs =
                await this.ssh.exec(`
journalctl -u xray -n 50 --no-pager
`);


            throw new Error(
                "Xray API is not listening\n" +
                logs,
            );
        }

    }

    private extract(
        text: string,
        key: string,
    ): string | null {


        const line =
            text
                .split("\n")
                .find(
                    item =>
                        item.startsWith(key),
                );



        if (!line) {
            return null;
        }



        return line
            .split(":")
            .slice(1)
            .join(":")
            .trim();

    }

}