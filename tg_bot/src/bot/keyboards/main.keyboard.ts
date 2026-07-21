import { Markup } from "telegraf";

export const mainMenuKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback(
            "🔌 Подключить VPN",
            "connect_vpn"
        ),
    ],
    [
        Markup.button.callback(
            "💳 Моя подписка",
            "subscription"
        ),
    ],
    [
        Markup.button.callback(
            "❓ Помощь",
            "help"
        ),
    ],
]);
