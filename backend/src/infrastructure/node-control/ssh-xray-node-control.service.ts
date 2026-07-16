import fs from "node:fs";

import { Client } from "ssh2";

import VpnCredential from "../../modules/vpn/vpn-credential.model";
import VpnNode from "../../modules/vpn-nodes/vpn-node.model";

import { NodeControlService } from "./node-control.service";

class SshXrayNodeControlService implements NodeControlService {
    private readonly privateKey: Buffer;

    constructor() {
        const privateKeyPath =
            process.env.VPN_NODE_SSH_PRIVATE_KEY_PATH;

        if (!privateKeyPath) {
            throw new Error(
                "VPN_NODE_SSH_PRIVATE_KEY_PATH is not defined"
            );
        }

        this.privateKey = fs.readFileSync(privateKeyPath);
    }

    private execute(
        node: VpnNode,
        command: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const client = new Client();

            client
                .on("ready", () => {
                    client.exec(command, (error, stream) => {
                        if (error) {
                            client.end();
                            reject(error);

                            return;
                        }

                        let stdout = "";
                        let stderr = "";

                        stream.on("data", (data: Buffer) => {
                            stdout += data.toString();
                        });

                        stream.stderr.on(
                            "data",
                            (data: Buffer) => {
                                stderr += data.toString();
                            }
                        );

                        stream.on(
                            "close",
                            (code: number | null) => {
                                client.end();

                                if (code !== 0) {
                                    reject(
                                        new Error(
                                            `Node command failed with code ${code}: ${stderr}`
                                        )
                                    );

                                    return;
                                }

                                resolve(stdout);
                            }
                        );
                    });
                })
                .on("error", reject)
                .connect({
                    host: node.host,
                    port: node.ssh_port,
                    username: node.ssh_user,
                    privateKey: this.privateKey,
                    readyTimeout: 10000,
                });
        });
    }

    async addUser(
        node: VpnNode,
        credential: VpnCredential
    ): Promise<void> {
        const email = `user_${credential.user_id}`;

        const command = `
set -e

EMAIL='${email}'
UUID='${credential.uuid}'
INBOUND_TAG='${node.inbound_tag}'

if /usr/local/bin/xray api inbounduser \
    --server=127.0.0.1:10085 \
    --tag="$INBOUND_TAG" \
    | grep -Fq "\\"email\\": \\"$EMAIL\\""
then
    echo "USER_ALREADY_EXISTS"
    exit 0
fi

TEMP_FILE=$(mktemp)

cleanup() {
    rm -f "$TEMP_FILE"
}

trap cleanup EXIT

cat > "$TEMP_FILE" <<EOF
{
  "inbounds": [
    {
      "tag": "$INBOUND_TAG",
      "port": ${node.port},
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "$UUID",
            "email": "$EMAIL",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      }
    }
  ]
}
EOF

/usr/local/bin/xray api adu \
    --server=127.0.0.1:10085 \
    "$TEMP_FILE"

echo "USER_ADDED"
    `.trim();

        const output = await this.execute(
            node,
            command
        );

        console.log(
            `[VPN] ${node.name}: ${output.trim()}`
        );
    }

    async removeUser(
        node: VpnNode,
        credential: VpnCredential
    ): Promise<void> {
        const email = `user_${credential.user_id}`;

        const command = `
set -e

EMAIL='${email}'
INBOUND_TAG='${node.inbound_tag}'

if ! /usr/local/bin/xray api inbounduser \
    --server=127.0.0.1:10085 \
    --tag="$INBOUND_TAG" \
    | grep -Fq "\\"email\\": \\"$EMAIL\\""
then
    echo "USER_NOT_FOUND"
    exit 0
fi

/usr/local/bin/xray api rmu \
    --server=127.0.0.1:10085 \
    -tag="$INBOUND_TAG" \
    "$EMAIL"

echo "USER_REMOVED"
    `.trim();

        const output = await this.execute(
            node,
            command
        );

        console.log(
            `[VPN] ${node.name}: ${output.trim()}`
        );
    }
}

export default new SshXrayNodeControlService();