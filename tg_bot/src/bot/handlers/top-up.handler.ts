import { Context } from "telegraf";

import {
    paymentConfirmationKeyboard,
    paymentMethodsKeyboard,
    topUpAmountsKeyboard,
} from "../keyboards/main.keyboard";

import {
    answerCallback,
    renderMessage,
} from "../utils/render-message";

import {
    getTelegramUserInfo,
} from "../services/user-info.service";

const paymentMethodNames:
    Record<string, string> = {
    sbp: "СБП",
    card: "Банковская карта",
    crypto: "Crypto Bot",
};

function formatBalance(
    balanceAmount: number
) {
    return (
        balanceAmount / 100
    ).toLocaleString("ru-RU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

export async function topUpBalanceHandler(
    ctx: Context
) {
    await answerCallback(ctx);

    if (!ctx.from) {
        return;
    }

    const user =
        await getTelegramUserInfo(
            ctx.from.id,
            ctx.from.username,
            ctx.from.first_name
        );

    const balance =
        formatBalance(
            Number(user.balanceAmount ?? 0)
        );

    await renderMessage(
        ctx,
        [
            "💳 Пополнение баланса",
            "",
            `Текущий баланс: ${balance} ₽`,
            "",
            "Выберите сумму пополнения:",
        ].join("\n"),
        topUpAmountsKeyboard
    );
}

export async function selectTopUpAmountHandler(
    ctx: Context,
    amount: number
) {
    await answerCallback(ctx);

    await renderMessage(
        ctx,
        [
            "💳 Пополнение баланса",
            "",
            `Сумма: ${amount} ₽`,
            "",
            "Выберите способ оплаты:",
        ].join("\n"),
        paymentMethodsKeyboard(amount)
    );
}

export async function selectPaymentMethodHandler(
    ctx: Context,
    method: string,
    amount: number
) {
    await answerCallback(ctx);

    const methodName =
        paymentMethodNames[method];

    if (!methodName) {
        await ctx.reply(
            "Неизвестный способ оплаты."
        );

        return;
    }

    await renderMessage(
        ctx,
        [
            "Подтверждение оплаты",
            "",
            `Способ оплаты: ${methodName}`,
            `К оплате: ${amount} ₽`,
            "",
            "После успешной оплаты деньги будут зачислены на ваш баланс.",
        ].join("\n"),
        paymentConfirmationKeyboard(
            method,
            amount
        )
    );
}

export async function createPaymentHandler(
    ctx: Context,
    method: string,
    amount: number
) {
    await answerCallback(ctx);

    const methodName =
        paymentMethodNames[method];

    if (!methodName) {
        await ctx.reply(
            "Неизвестный способ оплаты."
        );

        return;
    }

    /**
     * ПОКА БЕЗ БЕКА.
     *
     * Здесь позже будет:
     *
     * const response = await backendApi.post(
     *     "/api/payments/create",
     *     {
     *         telegramId: String(ctx.from!.id),
     *         amount,
     *         method,
     *     }
     * );
     */

    await renderMessage(
        ctx,
        [
            "🚧 Оплата пока находится в разработке",
            "",
            `Способ: ${methodName}`,
            `Сумма: ${amount} ₽`,
            "",
            "Интерфейс уже работает. Создание реального счёта подключим следующим этапом.",
        ].join("\n"),
        paymentConfirmationKeyboard(
            method,
            amount
        )
    );
}