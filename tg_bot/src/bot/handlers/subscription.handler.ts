import { Context } from "telegraf";


export async function subscriptionHandler(
    ctx: Context
){

    await ctx.answerCbQuery();


    await ctx.reply(
        "Функция подписки пока в разработке"
    );
}