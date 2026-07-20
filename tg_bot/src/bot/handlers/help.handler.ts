import {
    Context,
    Markup,
} from "telegraf";

import {
    answerCallback,
    renderMessage,
} from "../utils/render-message";

export async function helpHandler(
    ctx: Context
) {
    await answerCallback(ctx);

    await renderMessage(
        ctx,
        [
            "❓ Помощь",
            "",
            "Возникли проблемы с подключением или оплатой?",
            "",
            "Напишите в поддержку, и мы постараемся помочь.",
        ].join("\n"),
        Markup.inlineKeyboard([
            [
                Markup.button.url(
                    "💬 Написать в поддержку",
                    "https://t.me/NikSiting"
                ),
            ],
            [
                Markup.button.callback(
                    "◀️ Назад",
                    "main_menu"
                ),
            ],
        ])
    );
}