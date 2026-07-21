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


interface CreatePaymentResponse {
    paymentId: number;

    orderId: number;
    paymentMethodId: number;

    paymentUrl: string | null;

    amount: number;
    currency: string;

    status: string;
}


function formatPrice(
    amount: number,
    currency: string
): string {
    const currencySymbols:
        Record<string, string> = {
        RUB: "₽",
        USD: "$",
        EUR: "€",
        USDT: "USDT",
    };

    const symbol =
        currencySymbols[currency] ??
        currency;

    const price =
        Number(amount) / 100;

    return `${price}${symbol}`;
}


export async function paymentHandler(
    ctx: Context,
    orderId: number,
    paymentMethodId: number
): Promise<void> {
    await answerCallback(ctx);

    try {
        const paymentResponse =
            await backendApi.post<CreatePaymentResponse>(
                "/api/payments/create",
                {
                    orderId,
                    paymentMethodId,
                }
            );

        const {
            paymentId,
            paymentUrl,
        } = paymentResponse.data;

        if (paymentUrl) {
            await renderMessage(
                ctx,
                "Оплатите подписку и затем нажмите «Проверить оплату»:",
                Markup.inlineKeyboard([
                    [
                        Markup.button.url(
                            "Оплатить",
                            paymentUrl
                        ),
                    ],
                    [
                        Markup.button.callback(
                            "Проверить оплату",
                            `check_payment:${paymentId}`
                        ),
                    ],
                    [
                        Markup.button.callback(
                            "⬅️ Назад",
                            "extend_subscription"
                        ),
                    ],
                ])
            );

            return;
        }

        await renderMessage(
            ctx,
            "Тестовый платёж создан. Нажмите кнопку для подтверждения:",
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "Проверить оплату",
                        `check_payment:${paymentId}`
                    ),
                ],
                [
                    Markup.button.callback(
                        "⬅️ Назад",
                        "extend_subscription"
                    ),
                ],
            ])
        );
    } catch (error) {
        console.error(
            "Create payment error:",
            error
        );

        await renderMessage(
            ctx,
            [
                "Не удалось создать счёт.",
                "",
                "Попробуйте выбрать способ оплаты ещё раз.",
            ].join("\n"),
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "⬅️ Назад",
                        "extend_subscription"
                    ),
                ],
            ])
        );
    }
}