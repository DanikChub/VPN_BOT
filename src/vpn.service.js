const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const xrayService = require("./xray.service");

const USERS_FILE = path.join(
    __dirname,
    "../data/users.json"
);

class VpnService {
    async readUsers() {
        try {
            const content = await fs.readFile(
                USERS_FILE,
                "utf8"
            );

            return JSON.parse(content);
        } catch (error) {
            if (error.code === "ENOENT") {
                return {};
            }

            throw error;
        }
    }

    async writeUsers(users) {
        await fs.writeFile(
            USERS_FILE,
            JSON.stringify(users, null, 2)
        );
    }

    async getOrCreateAccess(telegramUser) {
        const users = await this.readUsers();

        const key = String(telegramUser.id);

        if (users[key]) {
            return users[key];
        }

        const access = {
            telegramId: telegramUser.id,
            username: telegramUser.username ?? null,
            uuid: crypto.randomUUID(),
            xrayEmail: `tg_${telegramUser.id}`,
            createdAt: new Date().toISOString(),
        };

        await xrayService.addUser({
            uuid: access.uuid,
            email: access.xrayEmail,
        });

        users[key] = access;

        await this.writeUsers(users);

        return access;
    }

    buildVlessUrl(access) {
        const params = new URLSearchParams({
            type: "tcp",
            security: "reality",
            pbk: process.env.REALITY_PASSWORD,
            fp: "chrome",
            sni: "www.cloudflare.com",
            sid: "f633b344d6bf8781",
            flow: "xtls-rprx-vision",
        });

        return (
            `vless://${access.uuid}` +
            `@85.234.106.66:443` +
            `?${params.toString()}` +
            `#Amsterdam`
        );
    }
}

module.exports = new VpnService();
