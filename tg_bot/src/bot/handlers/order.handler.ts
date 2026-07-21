import {
    Context,
    Markup,
} from "telegraf";

import backendApi
    from "../../api/backend.api";

import {
    getTelegramUserInfo,
} from "../services/user-info.service";

import {
    answerCallback,
    renderMessage,
} from "../utils/render-message";


interface CreateOrderResponse {
    id: number;

    plan_name: string;
    duration_days: number;

    amount: number;
    currency: string;
}


interface PaymentMethod {
    id: number;
    code: string;
    name: string;
    is_active: boolean;
    sort_order: number;
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


export async function selectPlanHandler(
    ctx: Context,
    planId: number
): Promise<void> {
    await answerCallback(ctx);

    try {
        if (!ctx.from) {
            throw new Error(
                "Telegram user not found"
            );
        }

        const user =
            await getTelegramUserInfo(
                ctx.from.id,
                ctx.from.username,
                ctx.from.first_name
            );

        const orderResponse =
            await backendApi.post<CreateOrderResponse>(
                "/api/orders/create",
                {
                    userId: user.id,
                    planId,
                }
            );

        const order =
            orderResponse.data;

        const paymentMethodsResponse =
            await backendApi.get<PaymentMethod[]>(
                "/api/payment-methods/active"
            );

        const paymentMethods =
            paymentMethodsResponse.data;

        if (
            paymentMethods.length === 0
        ) {
            await renderMessage(
                ctx,
                "Сейчас нет доступных способов оплаты.",
                Markup.inlineKeyboard([
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

        const paymentButtons =
            paymentMethods.map(
                (method) =>
                    Markup.button.callback(
                        method.name,
                        `pay:${order.id}:${method.id}`
                    )
            );

        const paymentRows = [];

        for (
            let index = 0;
            index < paymentButtons.length;
            index += 2
        ) {
            paymentRows.push(
                paymentButtons.slice(
                    index,
                    index + 2
                )
            );
        }

        paymentRows.push([
            Markup.button.callback(
                "⬅️ Назад",
                "extend_subscription"
            ),
        ]);

        const price =
            formatPrice(
                order.amount,
                order.currency
            );

        await renderMessage(
            ctx,
            [
                `Подписка на ${order.duration_days} дней`,
                "",
                `🟢 К оплате: ${price}`,
                "",
                "Выберите способ оплаты:",
            ].join("\n"),
            Markup.inlineKeyboard(
                paymentRows
            )
        );
    } catch (error) {
        console.error(
            "Select plan error:",
            error
        );

        await renderMessage(
            ctx,
            [
                "Не удалось создать заказ.",
                "",
                "Попробуйте ещё раз немного позже.",
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