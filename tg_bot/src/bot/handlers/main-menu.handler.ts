import { Context } from "telegraf";

import {
    mainMenuKeyboard,
} from "../keyboards/main.keyboard";

import {
    answerCallback,
    renderMessage,
} from "../utils/render-message";

import {
    getTelegramUserInfo,
} from "../services/user-info.service";

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

function formatSubscriptionDate(
    value: string | null
) {
    if (!value) {
        return "не активна";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "не активна";
    }

    if (date.getTime() <= Date.now()) {
        return "не активна";
    }

    return `активна до ${date.toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    )}`;
}

export async function mainMenuHandler(
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

    const name =
        user.firstName ||
        ctx.from.first_name ||
        ctx.from.username ||
        "пользователь";

    const balance =
        formatBalance(
            Number(user.balanceAmount ?? 0)
        );

    const subscription =
        formatSubscriptionDate(
            user.subscriptionActiveUntil ?? null
        );

    const text = [
        `Приветствую, ${name}!`,
        "",
        `💰 Ваш баланс: ${balance} ₽\n`,
        `📅 Ваша подписка ${subscription}`,
        "",
        "Выберите действие:",
    ].join("\n");

    await renderMessage(
        ctx,
        text,
        mainMenuKeyboard
    );
}