import "dotenv/config";

import { Telegraf } from "telegraf";

import {helpHandler} from "./bot/handlers/help.handler";
import {mainMenuHandler} from "./bot/handlers/main-menu.handler";
import {connectVpnHandler} from "./bot/handlers/connect-vpn.handler";
import {subscriptionHandler} from "./bot/handlers/subscription.handler";
import {plansHandler} from "./bot/handlers/plan.handler";
import {selectPlanHandler} from "./bot/handlers/order.handler";
import {paymentHandler} from "./bot/handlers/payment.handler";
import {checkPaymentHandler} from "./bot/handlers/check-payment.handler";


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
    "subscription",
    subscriptionHandler
);

bot.action(
    "extend_subscription",
    plansHandler
);

bot.action(
    /^select_plan:(\d+)$/,
    async (ctx) => {

        const planId =
            Number(ctx.match[1]);


        await selectPlanHandler(
            ctx,
            planId
        );
    }
);

bot.action(
    /^pay:(\d+):(\d+)$/,
    async (ctx) => {

        const orderId =
            Number(ctx.match[1]);

        const paymentMethodId =
            Number(ctx.match[2]);


        await paymentHandler(
            ctx,
            orderId,
            paymentMethodId
        );
    }
);

bot.action(
    /^check_payment:(\d+)$/,
    async (ctx) => {

        const paymentId =
            Number(
                ctx.match[1]
            );


        await checkPaymentHandler(
            ctx,
            paymentId
        );
    }
);

bot.action(
    "help",
    helpHandler
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