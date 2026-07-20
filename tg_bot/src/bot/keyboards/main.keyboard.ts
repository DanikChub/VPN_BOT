import { Markup } from "telegraf";

export const mainMenuKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback(
            "🔌 Подключить VPN",
            "connect_vpn"
        ),
    ],
    // [
    //     Markup.button.callback(
    //         "💳 Пополнить баланс",
    //         "top_up_balance"
    //     ),
    // ],
    [
        Markup.button.callback(
            "Моя подписка",
            "my_subscription"
        ),
    ],
    [
        Markup.button.callback(
            "❓ Помощь",
            "help"
        ),
    ],
]);

export const topUpAmountsKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback(
            "100 ₽",
            "top_up_amount_100"
        ),
        Markup.button.callback(
            "150 ₽",
            "top_up_amount_150"
        ),
    ],
    [
        Markup.button.callback(
            "500 ₽",
            "top_up_amount_500"
        ),
        Markup.button.callback(
            "1000 ₽",
            "top_up_amount_1000"
        ),
    ],
    [
        Markup.button.callback(
            "◀️ Назад",
            "main_menu"
        ),
    ],
]);

export function paymentMethodsKeyboard(
    amount: number
) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(
                "⚡ СБП",
                `payment_method_sbp_${amount}`
            ),
        ],
        [
            Markup.button.callback(
                "💳 Банковская карта",
                `payment_method_card_${amount}`
            ),
        ],
        [
            Markup.button.callback(
                "₿ Crypto Bot",
                `payment_method_crypto_${amount}`
            ),
        ],
        [
            Markup.button.callback(
                "◀️ Назад",
                "top_up_balance"
            ),
        ],
    ]);
}

export function paymentConfirmationKeyboard(
    method: string,
    amount: number
) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(
                "✅ Оформить оплату",
                `create_payment_${method}_${amount}`
            ),
        ],
        [
            Markup.button.callback(
                "◀️ Назад",
                `top_up_amount_${amount}`
            ),
        ],
    ]);
}

export const backToMainMenuKeyboard =
    Markup.inlineKeyboard([
        [
            Markup.button.callback(
                "◀️ Назад",
                "main_menu"
            ),
        ],
    ]);

export const insufficientBalanceKeyboard =
    Markup.inlineKeyboard([
        [
            Markup.button.callback(
                "💳 Пополнить баланс",
                "top_up_balance"
            ),
        ],
        [
            Markup.button.callback(
                "◀️ Назад",
                "main_menu"
            ),
        ],
    ]);