const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const execFileAsync = promisify(execFile);

class XrayService {
    constructor() {
    	this.binary = "/usr/local/bin/xray";
        this.apiAddress =
            process.env.XRAY_API_ADDRESS;

    	this.inboundTag =
        	process.env.XRAY_INBOUND_TAG;
    }
    async addUser({ uuid, email }) {
        const tempFile = path.join(
            "/tmp",
            `xray-user-${crypto.randomUUID()}.json`
        );

        const config = {
            inbounds: [
                {
                    tag: this.inboundTag,
                    port: 443,
                    protocol: "vless",
                    settings: {
                        clients: [
                            {
                                id: uuid,
                                email,
                                flow: "xtls-rprx-vision",
                            },
                        ],
                        decryption: "none",
                    },
                },
            ],
        };

        try {
            await fs.writeFile(
                tempFile,
                JSON.stringify(config, null, 2),
                {
                    mode: 0o600,
                }
            );

            const { stdout, stderr } = await execFileAsync(
                this.binary,
                [
                    "api",
                    "adu",
                    `--server=${this.apiAddress}`,
                    tempFile,
                ],
                {
                    timeout: 5000,
                }
            );

            if (stderr) {
                console.error("[XRAY STDERR]", stderr);
            }

            return stdout;
        } finally {
            await fs.rm(tempFile, { force: true });
        }
    }

    async listUsers() {
        const { stdout } = await execFileAsync(
            this.binary,
            [
                "api",
                "inbounduser",
                `--server=${this.apiAddress}`,
                `--tag=${this.inboundTag}`,
            ],
            {
                timeout: 5000,
            }
        );

        return JSON.parse(stdout);
    }
}

module.exports = new XrayService();
