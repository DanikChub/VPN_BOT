import {
    Context,
    Markup,
} from "telegraf";

import axios from "axios";
import QRCode from "qrcode";

import backendApi
    from "../../api/backend.api";

import {
    answerCallback,
    renderMessage,
} from "../utils/render-message";

import {
    getTelegramUserInfo,
} from "../services/user-info.service";


interface SubscriptionDetailsResponse {
    id: number;
    user_id: number;
    status: "active" | "expired";
    expires_at: string;
    subscription_url: string | null;
}


function formatDate(
    value: string
): string {
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
            await backendApi.get<SubscriptionDetailsResponse>(
                `/api/subscription/user/${user.id}/details`
            );

        const subscription =
            response.data;

        const expiresAt =
            new Date(
                subscription.expires_at
            );

        const isActive =
            subscription.status === "active" &&
            !Number.isNaN(
                expiresAt.getTime()
            ) &&
            expiresAt.getTime() >
            Date.now();

        if (!isActive) {
            await renderMessage(
                ctx,
                [
                    "🔴 Нет активной подписки",
                    "",
                    "Для подключения VPN необходимо приобрести или продлить подписку.",
                ].join("\n"),
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(
                            "💳 Купить подписку",
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

        const subscriptionUrl =
            subscription.subscription_url;

        if (!subscriptionUrl) {
            throw new Error(
                "Backend did not return subscription_url"
            );
        }

        const qrCodeBuffer =
            await QRCode.toBuffer(
                subscriptionUrl,
                {
                    type: "png",
                    width: 700,
                    margin: 2,
                    errorCorrectionLevel: "M",
                }
            );

        await ctx.replyWithPhoto(
            {
                source: qrCodeBuffer,
            },
            {
                caption: [
                    "🔑 Ваш ключ подключения",
                    "",
                    `📅 Подписка активна до: ${formatDate(
                        subscription.expires_at
                    )}`,
                    "",
                    "📎 Ссылка для подключения:",
                    "",
                    `<code>${subscriptionUrl}</code>`,
                    "",
                    "Отсканируйте QR-код в приложении или нажмите кнопку ниже.",
                    "",
                    "⚠️ Не передавайте эту ссылку другим людям.",
                ].join("\n"),

                parse_mode: "HTML",

                ...Markup.inlineKeyboard([
                    [
                        Markup.button.url(
                            "🔌 Подключить VPN",
                            subscriptionUrl
                        ),
                    ],
                    [
                        Markup.button.callback(
                            "◀️ Главное меню",
                            "main_menu"
                        ),
                    ],
                ]),
            }
        );
    } catch (error) {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 404
        ) {
            await renderMessage(
                ctx,
                [
                    "🔴 Нет активной подписки",
                    "",
                    "Сначала приобретите подписку.",
                ].join("\n"),
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(
                            "💳 Купить подписку",
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
            "CONNECT VPN ERROR:",
            axios.isAxiosError(error)
                ? error.response?.data
                : error
        );

        await renderMessage(
            ctx,
            [
                "⚠️ Не удалось получить ссылку",
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
                        "◀️ Главное меню",
                        "main_menu"
                    ),
                ],
            ])
        );
    }
}