import {
    Context,
    Markup,
} from "telegraf";

import backendApi
    from "../../api/backend.api";

import {
    answerCallback,
    renderMessage,
} from "../utils/render-message";


interface CheckPaymentResponse {
    paymentId: number;
    status: string;
    paid: boolean;
    expiresAt?: string;
    subscriptionUrl?: string;
}


export async function checkPaymentHandler(
    ctx: Context,
    paymentId: number
): Promise<void> {
    await answerCallback(
        ctx,
        "Проверяем оплату..."
    );

    try {
        const response =
            await backendApi.post<CheckPaymentResponse>(
                `/api/payments/${paymentId}/check`
            );

        const result =
            response.data;

        if (!result.paid) {
            await renderMessage(
                ctx,
                [
                    "⏳ Оплата пока не найдена.",
                    "",
                    "Если вы только что оплатили, попробуйте проверить ещё раз через несколько секунд.",
                ].join("\n"),
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(
                            "🔄 Проверить ещё раз",
                            `check_payment:${paymentId}`
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

        if (!result.subscriptionUrl) {
            throw new Error(
                "Backend did not return subscription URL"
            );
        }

        await renderMessage(
            ctx,
            [
                "✅ Оплата успешно подтверждена!",
                "",
                `Подписка активна до: ${
                    result.expiresAt
                        ? new Date(
                            result.expiresAt
                        ).toLocaleString(
                            "ru-RU"
                        )
                        : "не указано"
                }`,
                "",
                "Ссылка для подключения:",
                result.subscriptionUrl,
                "",
                "Добавьте эту ссылку в VPN-клиент как ссылку подписки.",
            ].join("\n"),
            Markup.inlineKeyboard([
                [
                    Markup.button.url(
                        "🔌 Подключить VPN",
                        result.subscriptionUrl
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
        console.error(
            "CHECK PAYMENT ERROR:",
            error
        );

        await renderMessage(
            ctx,
            [
                "⚠️ Не удалось проверить оплату.",
                "",
                "Попробуйте ещё раз немного позже.",
            ].join("\n"),
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "🔄 Проверить ещё раз",
                        `check_payment:${paymentId}`
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