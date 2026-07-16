import "dotenv/config";

import { initDatabase } from "../database";
import VpnNode from "../modules/vpn-nodes/vpn-node.model";


const main = async (): Promise<void> => {
    await initDatabase();

    const [node, created] = await VpnNode.findOrCreate({
        where: {
            name: "Amsterdam",
        },
        defaults: {
            name: "Amsterdam",
            host: "85.234.106.66",
            port: 443,

            reality_public_key:
                "930b9JAfFZHeT9yWW5OLbQoczldewD6o8DMfdrdXKRk",

            reality_server_name:
                "www.cloudflare.com",

            reality_short_id:
                "f633b344d6bf8781",

            inbound_tag:
                "vless-reality-in",

            is_active: true,
        },
    });

    console.log({
        created,
        node: node.toJSON(),
    });

    process.exit(0);
};

void main();