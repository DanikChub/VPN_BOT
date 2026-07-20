import { Context } from "telegraf";

export async function answerCallback(
    ctx: Context
) {
    if (ctx.callbackQuery) {
        await ctx.answerCbQuery();
    }
}

export async function renderMessage(
    ctx: Context,
    text: string,
    keyboard: object
) {
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageText(
                text,
                keyboard
            );

            return;
        } catch (error: any) {
            /**
             * Telegram ругается, если текст и клавиатура
             * вообще не изменились. Это можно игнорировать.
             */
            if (
                error?.description?.includes(
                    "message is not modified"
                )
            ) {
                return;
            }
        }
    }

    await ctx.reply(
        text,
        keyboard
    );
}