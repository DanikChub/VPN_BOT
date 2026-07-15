const crypto = require("node:crypto");
const xrayService = require("./xray.service");

async function main() {
    const uuid = crypto.randomUUID();

    console.log("Creating:", uuid);

    await xrayService.addUser({
        uuid,
        email: `test_${Date.now()}`,
    });

    const users = await xrayService.listUsers();

    console.dir(users, {
        depth: null,
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
