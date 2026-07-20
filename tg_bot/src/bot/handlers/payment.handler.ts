import { Context } from "telegraf";
import { Markup } from "telegraf";
import backendApi from "../../api/backend.api";

import {
    plansKeyboard
} from "../keyboards/main.keyboard";


export async function buyVpnHandler(
    ctx: Context
) {

    await ctx.answerCbQuery();


    await ctx.reply(
        "Выберите тариф:",
        plansKeyboard
    );
}



export async function buyPlanHandler(
    ctx: Context,
    planId:number
) {

    await ctx.answerCbQuery();


    const telegramId =
        ctx.from!.id;


    // пока временно получаем пользователя
    const userResponse =
        await backendApi.post(
            "/api/users/telegram",
            {
                telegramId:
                    String(telegramId),

                username:
                    ctx.from?.username ?? null,

                firstName:
                    ctx.from?.first_name ?? null,
            }
        );


    const orderResponse =
        await backendApi.post(
            "/api/orders/create",
            {
                userId:
                userResponse.data.id,

                planId
            }
        );


    const {
        orderId,
        paymentId,
        paymentUrl
    } = orderResponse.data;


    await ctx.reply(
        [
            "💳 Заказ создан",
            "",
            "Нажмите кнопку ниже для оплаты.",
            "После оплаты нажмите «Проверить оплату»."
        ].join("\n"),

        Markup.inlineKeyboard([
            [
                Markup.button.url(
                    "💳 Оплатить",
                    paymentUrl
                )
            ],
            [
                Markup.button.callback(
                    "🔄 Проверить оплату",
                    `check_payment_${paymentId}`
                )
            ]
        ])
    );
}