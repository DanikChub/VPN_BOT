import "dotenv/config";

import { Telegraf } from "telegraf";

import {helpHandler} from "./bot/handlers/help.handler";
import {mainMenuHandler} from "./bot/handlers/main-menu.handler";
import {connectVpnHandler} from "./bot/handlers/connect-vpn.handler";
import {
    createPaymentHandler,
    selectPaymentMethodHandler,
    selectTopUpAmountHandler,
    topUpBalanceHandler
} from "./bot/handlers/top-up.handler";
import {subscriptionHandler} from "./bot/handlers/subscription.handler";


const token = process.env.BOT_TOKEN;


if(!token){
    throw new Error(
        "BOT_TOKEN is not defined"
    );
}


const bot = new Telegraf(token);


bot.start(mainMenuHandler);

bot.action(
    "main_menu",
    mainMenuHandler
);

bot.action(
    "connect_vpn",
    connectVpnHandler
);

bot.action(
    "top_up_balance",
    topUpBalanceHandler
);

bot.action(
    "my_subscription",
    subscriptionHandler
);

bot.action(
    "help",
    helpHandler
);


bot.action(
    /^top_up_amount_(\d+)$/,
    async ctx => {
        const amount =
            Number(ctx.match[1]);

        await selectTopUpAmountHandler(
            ctx,
            amount
        );
    }
);

bot.action(
    /^payment_method_([a-z_]+)_(\d+)$/,
    async ctx => {
        const method =
            ctx.match[1];

        const amount =
            Number(ctx.match[2]);

        await selectPaymentMethodHandler(
            ctx,
            method,
            amount
        );
    }
);

bot.action(
    /^create_payment_([a-z_]+)_(\d+)$/,
    async ctx => {
        const method =
            ctx.match[1];

        const amount =
            Number(ctx.match[2]);

        await createPaymentHandler(
            ctx,
            method,
            amount
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