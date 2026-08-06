import {
    UserRoundX,
} from "lucide-react";

import {
    type UserDetails as UserDetailsType,
} from "@/entities/user";

import {
    Card,
    CardContent,
    EmptyState,
    Spinner,
} from "@/shared/ui";

import {
    formatDate,
    formatMoney,
} from "@/shared/lib";

import {
    ManageUserSubscription,
} from "@/features/manage-user-subscription";


interface UserDetailsContentProps {
    user:
        | UserDetailsType
        | null;

    isLoading: boolean;

    errorMessage:
        | string
        | null;

    onReload: () =>
        Promise<void>;
}


const UserDetailsContent = ({
                                user,
                                isLoading,
                                errorMessage,
                                onReload,
                            }: UserDetailsContentProps) => {
    if (errorMessage) {
        return (
            <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {errorMessage}
            </div>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex min-h-72 items-center justify-center">
                    <Spinner size="lg" />
                </CardContent>
            </Card>
        );
    }

    if (!user) {
        return (
            <EmptyState
                description="Пользователь отсутствует или был удалён."
                icon={
                    <UserRoundX className="size-6" />
                }
                title="Пользователь не найден"
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-2">
                <Card>
                    <CardContent>
                        <h2 className="text-lg font-semibold text-slate-950">
                            Основная информация
                        </h2>

                        <div className="mt-5 space-y-4">
                            <DetailsRow
                                label="ID"
                                value={String(user.id)}
                            />

                            <DetailsRow
                                label="Имя"
                                value={
                                    user.firstName ||
                                    "Не указано"
                                }
                            />

                            <DetailsRow
                                label="Username"
                                value={
                                    user.username
                                        ? `@${user.username}`
                                        : "Не указан"
                                }
                            />

                            <DetailsRow
                                label="Telegram ID"
                                value={user.telegramId}
                                monospace
                            />

                            <DetailsRow
                                label="Баланс"
                                value={formatMoney(
                                    user.balanceAmount
                                )}
                            />

                            <DetailsRow
                                label="Дата регистрации"
                                value={formatDate(
                                    user.createdAt
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <h2 className="text-lg font-semibold text-slate-950">
                            Подписка
                        </h2>

                        <div className="mt-5 space-y-4">
                            <DetailsRow
                                label="Статус"
                                value={
                                    getSubscriptionStatusLabel(
                                        user
                                    )
                                }
                            />

                            <DetailsRow
                                label="Действует до"
                                value={formatDate(
                                    user.subscription
                                        ?.expiresAt
                                )}
                            />

                            <DetailsRow
                                label="Создана"
                                value={formatDate(
                                    user.subscription
                                        ?.createdAt
                                )}
                            />

                            <DetailsRow
                                label="Обновлена"
                                value={formatDate(
                                    user.subscription
                                        ?.updatedAt
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <ManageUserSubscription
                user={user}
                onSuccess={onReload}
            />
        </div>
    );
};


interface DetailsRowProps {
    label: string;
    value: string;
    monospace?: boolean;
}


function DetailsRow({
                        label,
                        value,
                        monospace = false,
                    }: DetailsRowProps) {
    return (
        <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
            <span className="text-sm text-slate-500">
                {label}
            </span>

            <span
                className={
                    monospace
                        ? "break-all text-right font-mono text-sm text-slate-950"
                        : "text-right text-sm font-medium text-slate-950"
                }
            >
                {value}
            </span>
        </div>
    );
}


function getSubscriptionStatusLabel(
    user: UserDetailsType
): string {
    if (!user.subscription) {
        return "Нет подписки";
    }

    switch (user.subscription.status) {
        case "active":
            return "Активна";

        case "blocked":
            return "Заблокирована";

        case "expired":
            return "Истекла";

        default:
            return "Неизвестно";
    }
}


export default UserDetailsContent;