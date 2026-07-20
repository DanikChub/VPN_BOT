import { Context, Markup } from "telegraf";

import backendApi from "../../api/backend.api";

export async function showBalanceHandler(
    ctx: Context
) {
    await ctx.answerCbQuery();

    const telegramId =
        String(ctx.from!.id);

    const response = await backendApi.get(
        `/api/balances/telegram/${telegramId}`
    );

    const balanceAmount =
        Number(response.data.balanceAmount);

    const balanceRubles =
        balanceAmount / 100;

    await ctx.reply(
        [
            "💰 Ваш баланс",
            "",
            `${balanceRubles.toFixed(2)} ₽`,
            "",
            "Средства автоматически используются для оплаты VPN.",
        ].join("\n"),

        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "➕ Пополнить",
                    "top_up_balance"
                ),
            ],
            [
                Markup.button.callback(
                    "◀️ Главное меню",
                    "main_menu"
                ),
            ],
        ])
    );
}