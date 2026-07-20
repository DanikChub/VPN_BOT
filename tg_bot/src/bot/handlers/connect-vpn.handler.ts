import {
    Context,
    Markup,
} from "telegraf";

import backendApi from "../../api/backend.api";

import {
    insufficientBalanceKeyboard,
} from "../keyboards/main.keyboard";

import {
    answerCallback,
    renderMessage,
} from "../utils/render-message";

import {
    getTelegramUserInfo,
} from "../services/user-info.service";

const DAILY_PRICE_AMOUNT = 500;

interface ActivateVpnResponse {
    subscription_url: string;
    expires_at: string;
}

function formatMoney(
    amount: number
) {
    return (
        amount / 100
    ).toLocaleString("ru-RU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function formatDate(
    value: string
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );
}

export async function connectVpnHandler(
    ctx: Context
) {
    await answerCallback(ctx);

    if (!ctx.from) {
        return;
    }

    try {
        const user =
            await getTelegramUserInfo(
                ctx.from.id,
                ctx.from.username,
                ctx.from.first_name
            );

        const balanceAmount =
            Number(
                user.balanceAmount ?? 0
            );

        if (
            balanceAmount <
            DAILY_PRICE_AMOUNT
        ) {
            await renderMessage(
                ctx,
                [
                    "❌ Недостаточно средств",
                    "",
                    `Ваш баланс: ${formatMoney(
                        balanceAmount
                    )} ₽`,
                    "",
                    `Для подключения необходимо минимум ${formatMoney(
                        DAILY_PRICE_AMOUNT
                    )} ₽.`,
                ].join("\n"),
                insufficientBalanceKeyboard
            );

            return;
        }

        const response =
            await backendApi.post<ActivateVpnResponse>(
                "/api/vpn/access",
                {
                    user_id: user.id,
                }
            );

        const {
            subscription_url,
            expires_at,
        } = response.data;

        if (!subscription_url) {
            throw new Error(
                "Backend did not return subscription_url"
            );
        }

        await renderMessage(
            ctx,
            [
                "✅ VPN готов к подключению",
                "",
                `Баланс: ${formatMoney(
                    balanceAmount
                )} ₽`,
                `Подписка активна до: ${formatDate(
                    expires_at
                )}`,
                "",
                "Нажмите кнопку ниже, чтобы добавить VPN на устройство.",
            ].join("\n"),
            Markup.inlineKeyboard([
                [
                    Markup.button.url(
                        "🔌 Подключить VPN",
                        subscription_url
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
    } catch (error: any) {
        console.error(
            "CONNECT VPN ERROR:",
            error?.response?.data ??
            error?.message ??
            error
        );

        await renderMessage(
            ctx,
            [
                "⚠️ Не удалось подключить VPN",
                "",
                error?.response?.data?.message ??
                "Произошла ошибка при создании подключения.",
                "",
                "Попробуйте ещё раз.",
            ].join("\n"),
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "🔄 Повторить",
                        "connect_vpn"
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
}