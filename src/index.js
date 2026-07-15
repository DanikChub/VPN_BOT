require("dotenv").config();

const { createBot } = require("./bot");

async function main() {
    if (!process.env.BOT_TOKEN) {
        throw new Error("BOT_TOKEN is required");
    }

    const bot = createBot(
        process.env.BOT_TOKEN
    );

    await bot.launch();

    console.log("VPN bot started");

    const shutdown = async (signal) => {
        console.log(`Received ${signal}`);

        bot.stop(signal);
    };

    process.once("SIGINT", () =>
        shutdown("SIGINT")
    );

    process.once("SIGTERM", () =>
        shutdown("SIGTERM")
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
