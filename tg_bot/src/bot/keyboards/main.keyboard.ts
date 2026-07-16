import { Markup } from "telegraf";


export const mainKeyboard =
    Markup.inlineKeyboard([
        [
            Markup.button.callback(
                "🚀 Купить VPN",
                "buy_vpn"
            )
        ],
        [
            Markup.button.callback(
                "📄 Моя подписка",
                "subscription"
            )
        ]
    ]);


export const plansKeyboard =
    Markup.inlineKeyboard([
        [
            Markup.button.callback(
                "1 месяц",
                "buy_plan_1"
            )
        ],
        [
            Markup.button.callback(
                "3 месяца",
                "buy_plan_2"
            )
        ]
    ]);