const { Telegraf, Markup } = require("telegraf");

const vpnService = require("./vpn.service");

function createBot(token) {
    const bot = new Telegraf(token);

    bot.start(async (ctx) => {
        await ctx.reply(
            "🚀 VPN\n\nПодключение за минуту.",
            Markup.inlineKeyboard([
                Markup.button.callback(
                    "Получить VPN",
                    "get_vpn"
                ),
            ])
        );
    });

    bot.action("get_vpn", async (ctx) => {
        await ctx.answerCbQuery();

        try {
            const access =
                await vpnService.getOrCreateAccess(
                    ctx.from
                );

            const url =
                vpnService.buildVlessUrl(access);

            await ctx.reply(
                `Ваш VPN готов:\n\n${url}`
            );
        } catch (error) {
            console.error(error);

            await ctx.reply(
                "Не удалось создать VPN-доступ."
            );
        }
    });

    return bot;
}

module.exports = {
    createBot,
};
