import path from "node:path";

import { SSHClient } from "../ssh/ssh.client";
import { ScpClient } from "../ssh/scp.client";

interface InstallAgentOptions {
    nodeId: number;
    token: string;

    controlServerUrl: string;

    heartbeatIntervalMs: number;
}

export class AgentInstaller {
    constructor(
        private readonly ssh: SSHClient,
        private readonly scp: ScpClient,
    ) {}

    async install(
        options: InstallAgentOptions,
    ): Promise<void> {
        /*
         * Сначала устанавливаем Node.js.
         * До этого момента нельзя вызывать node -v.
         */
        await this.ssh.exec(`
set -e

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y curl ca-certificates gnupg

if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

node --version
npm --version
`);

        /*
         * Останавливаем старую версию агента
         */
        await this.ssh.exec(`
set -e

systemctl stop vpn-node-agent || true

rm -rf /opt/vpn-node-agent
mkdir -p /opt/vpn-node-agent
`);

        /*
         * Загружаем архив
         */
        const archive = path.resolve(
            "storage/releases/vpn-node-agent.tar.gz",
        );

        await this.scp.upload(
            archive,
            "/tmp/vpn-node-agent.tar.gz",
        );

        /*
         * Распаковываем
         */
        await this.ssh.exec(`
set -e

tar -xzf /tmp/vpn-node-agent.tar.gz \
    -C /opt/vpn-node-agent

rm -f /tmp/vpn-node-agent.tar.gz
`);

        /*
         * Создаём env
         */
        await this.ssh.exec(`
set -e

cat >/etc/vpn-node-agent.env <<'EOF'
NODE_ID=${options.nodeId}
NODE_TOKEN=${options.token}
CONTROL_SERVER_URL=${options.controlServerUrl}
HEARTBEAT_INTERVAL_MS=${options.heartbeatIntervalMs}
LOG_LEVEL=info
EOF
`);

        /*
         * Создаём systemd unit
         */
        await this.ssh.exec(`
set -e

cat >/etc/systemd/system/vpn-node-agent.service <<'EOF'
[Unit]
Description=VPN Node Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/vpn-node-agent
EnvironmentFile=/etc/vpn-node-agent.env
ExecStart=/usr/bin/node /opt/vpn-node-agent/dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
`);

        /*
         * Запускаем
         */
        await this.ssh.exec(`
set -e

systemctl daemon-reload
systemctl enable vpn-node-agent
systemctl restart vpn-node-agent

sleep 2
`);

        /*
         * Проверяем именно is-active.
         * Поиск слова "active" в systemctl status ненадёжен,
         * потому что там может быть "inactive".
         */
        const status = await this.ssh.exec(`
systemctl is-active vpn-node-agent
`);

        console.log(
            `vpn-node-agent status: ${status.trim()}`,
        );

        if (status.trim() !== "active") {
            const logs = await this.ssh.exec(`
journalctl -u vpn-node-agent -n 100 --no-pager || true
`);

            console.error(logs);

            throw new Error(
                "Node agent failed to start",
            );
        }
    }
}