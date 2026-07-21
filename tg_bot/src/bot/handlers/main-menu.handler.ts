import {
    Context,
} from "telegraf";

import axios from "axios";

import backendApi
    from "../../api/backend.api";

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


interface SubscriptionResponse {
    id: number;
    user_id: number;

    status:
        | "active"
        | "expired";

    expires_at: string;
}


function formatBalance(
    balanceAmount: number
): string {
    return (
        balanceAmount / 100
    ).toLocaleString(
        "ru-RU",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }
    );
}


function formatSubscription(
    subscription:
        SubscriptionResponse | null
): string {
    if (!subscription) {
        return "🔴 Не активна";
    }

    const expiresAt =
        new Date(
            subscription.expires_at
        );

    if (
        Number.isNaN(
            expiresAt.getTime()
        )
    ) {
        return "🔴 Не активна";
    }

    const isActive =
        subscription.status === "active" &&
        expiresAt.getTime() >
        Date.now();

    if (!isActive) {
        return "🔴 Не активна";
    }

    const formattedDate =
        expiresAt.toLocaleDateString(
            "ru-RU",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );

    const daysLeft =
        Math.max(
            0,
            Math.ceil(
                (
                    expiresAt.getTime() -
                    Date.now()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            )
        );

    return [
        "🟢 Активна",
        `до ${formattedDate}`,
        `(${daysLeft} дн.)`,
    ].join(" ");
}


async function getActualSubscription(
    userId: number
): Promise<SubscriptionResponse | null> {
    try {
        const response =
            await backendApi.get<SubscriptionResponse>(
                `/api/subscription/user/${userId}`
            );

        return response.data;
    } catch (error) {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 404
        ) {
            return null;
        }

        throw error;
    }
}


export async function mainMenuHandler(
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

        const subscription =
            await getActualSubscription(
                user.id
            );

        const name =
            user.firstName ||
            ctx.from.first_name ||
            ctx.from.username ||
            "пользователь";

        const balance =
            formatBalance(
                Number(
                    user.balanceAmount ??
                    0
                )
            );

        const subscriptionText =
            formatSubscription(
                subscription
            );

        const text = [
            `Приветствую, ${name}!`,
            "",
            `💰 Ваш баланс: ${balance} ₽`,
            "",
            `📅 Подписка: ${subscriptionText}`,
            "",
            "Выберите действие:",
        ].join("\n");

        await renderMessage(
            ctx,
            text,
            mainMenuKeyboard
        );
    } catch (error) {
        console.error(
            "Main menu loading error:",
            error
        );

        await renderMessage(
            ctx,
            [
                "Не удалось загрузить актуальные данные.",
                "",
                "Попробуйте открыть главное меню ещё раз.",
            ].join("\n"),
            mainMenuKeyboard
        );
    }
}