import "dotenv/config";

import { Telegraf } from "telegraf";

import {
    mainKeyboard
} from "./bot/keyboards/main.keyboard";


import {
    buyVpnHandler,
    buyPlanHandler
} from "./bot/handlers/payment.handler";


import {
    subscriptionHandler
} from "./bot/handlers/subscription.handler";


import backendApi from "./api/backend.api";


const token = process.env.BOT_TOKEN;


if(!token){
    throw new Error(
        "BOT_TOKEN is not defined"
    );
}


const bot = new Telegraf(token);



bot.start(async(ctx)=>{

    const response =
        await backendApi.post(
            "/api/users/telegram",
            {
                telegramId:
                    String(ctx.from.id),

                username:
                    ctx.from.username ?? null,

                firstName:
                    ctx.from.first_name ?? null,
            }
        );


    await ctx.reply(
        [
            `Привет, ${ctx.from.first_name} 👋`,
            "",
            `Ваш ID: ${response.data.id}`
        ].join("\n"),
        mainKeyboard
    );

});



bot.action(
    "buy_vpn",
    buyVpnHandler
);



bot.action(
    "buy_plan_1",
    (ctx)=>
        buyPlanHandler(ctx,1)
);



bot.action(
    "buy_plan_2",
    (ctx)=>
        buyPlanHandler(ctx,2)
);



bot.action(
    "subscription",
    subscriptionHandler
);

bot.action(
    /^check_payment_(\d+)$/,
    async(ctx)=>{

        await ctx.answerCbQuery();


        const paymentId =
            Number(ctx.match[1]);


        await backendApi.post(
            "/api/payments/fake-success",
            {
                paymentId
            }
        );


        await ctx.reply(
            [
                "🎉 Оплата подтверждена!",
                "",
                "VPN активирован 🚀"
            ].join("\n")
        );
    }
);


void bot.launch();


console.log(
    "Telegram bot started"
);


process.once(
    "SIGINT",
    ()=>bot.stop("SIGINT")
);


process.once(
    "SIGTERM",
    ()=>bot.stop("SIGTERM")
);