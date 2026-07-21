import {
    Context,
    Markup,
} from "telegraf";

import axios from "axios";

import backendApi
    from "../../api/backend.api";

import {
    getTelegramUserInfo,
} from "../services/user-info.service";

import {
    answerCallback,
    renderMessage,
} from "../utils/render-message";


interface SubscriptionResponse {
    id: number;
    user_id: number;
    status: "active" | "expired";
    expires_at: string;
}


export async function subscriptionHandler(
    ctx: Context
): Promise<void> {
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

        const response =
            await backendApi.get<SubscriptionResponse>(
                `/api/subscription/user/${user.id}`
            );

        const subscription =
            response.data;

        const expiresAt =
            new Date(
                subscription.expires_at
            );

        const now =
            new Date();

        const daysLeft =
            Math.max(
                0,
                Math.ceil(
                    (
                        expiresAt.getTime() -
                        now.getTime()
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                )
            );

        await renderMessage(
            ctx,
            [
                "🔑 Моя подписка",
                "",
                `Статус: ${
                    subscription.status === "active"
                        ? "🟢 Активна"
                        : "🔴 Неактивна"
                }`,
                `Активна до: ${expiresAt.toLocaleDateString(
                    "ru-RU"
                )}`,
                `Осталось: ${daysLeft} дн.`,
            ].join("\n"),
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "🔑 Мой ключ",
                        "connect_vpn"
                    ),
                ],
                [
                    Markup.button.callback(
                        "💳 Продлить подписку",
                        "extend_subscription"
                    ),
                ],
                [
                    Markup.button.callback(
                        "◀️ Главное меню",
                        "main_menu"
                    ),
                ],
            ])
        );
    } catch (error) {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 404
        ) {
            await renderMessage(
                ctx,
                [
                    "🔑 Моя подписка",
                    "",
                    "У вас пока нет активной подписки.",
                ].join("\n"),
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(
                            "💳 Продлить подписку",
                            "extend_subscription"
                        ),
                    ],
                    [
                        Markup.button.callback(
                            "◀️ Главное меню",
                            "main_menu"
                        ),
                    ],
                ])
            );

            return;
        }

        console.error(
            "SUBSCRIPTION ERROR:",
            error
        );

        await renderMessage(
            ctx,
            [
                "Не удалось загрузить информацию о подписке.",
                "",
                "Попробуйте ещё раз.",
            ].join("\n"),
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "🔄 Повторить",
                        "subscription"
                    ),
                ],
                [
                    Markup.button.callback(
                        "◀️ Главное меню",
                        "main_menu"
                    ),
                ],
            ])
        );
    }
}