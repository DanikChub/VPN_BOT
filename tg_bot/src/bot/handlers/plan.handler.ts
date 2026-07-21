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


interface Plan {
    id: number;
    name: string;
    duration_days: number;
    price_amount: number;
    currency: string;
    is_active: boolean;
}


export async function plansHandler(
    ctx: Context
): Promise<void> {
    await answerCallback(ctx);

    try {
        const response =
            await backendApi.get<Plan[]>(
                "/api/plans/active"
            );

        const plans =
            response.data;

        if (plans.length === 0) {
            await renderMessage(
                ctx,
                [
                    "⚡ Тарифы",
                    "",
                    "Сейчас нет доступных тарифов.",
                ].join("\n"),
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(
                            "⬅️ Назад",
                            "subscription"
                        ),
                    ],
                ])
            );

            return;
        }

        const plansText =
            plans
                .map((plan) => {
                    const priceRubles =
                        plan.price_amount /
                        100;

                    return `${plan.name} — ${priceRubles} ₽`;
                })
                .join("\n");

        const planButtons =
            plans.map((plan) => {
                const priceRubles =
                    plan.price_amount /
                    100;

                return [
                    Markup.button.callback(
                        `${plan.name}, ${priceRubles} ₽`,
                        `select_plan:${plan.id}`
                    ),
                ];
            });

        await renderMessage(
            ctx,
            [
                "⚡ Тарифы",
                "",
                plansText,
                "",
                "Выберите подходящий тариф:",
            ].join("\n"),
            Markup.inlineKeyboard([
                ...planButtons,
                [
                    Markup.button.callback(
                        "⬅️ Назад",
                        "subscription"
                    ),
                ],
            ])
        );
    } catch (error) {
        console.error(
            "Failed to load plans:",
            error
        );

        await renderMessage(
            ctx,
            "Не удалось загрузить тарифы. Попробуйте позже.",
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "⬅️ Назад",
                        "subscription"
                    ),
                ],
            ])
        );
    }
}