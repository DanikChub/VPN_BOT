import {
    useState,
} from "react";

import {
    Ban,
    CalendarPlus,
    CircleCheck,
    CircleX,
    ShieldCheck,
} from "lucide-react";

import type {
    UserDetails,
} from "@/entities/user";

import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/shared/ui";

import useManageUserSubscription
    from "../model";

import {
    ExtendSubscriptionModal,
} from "./ExtendSubscriptionModal";

import {
    ConfirmSubscriptionActionModal,
} from "./ConfirmSubscriptionActionModal";


type OpenModal =
    | "extend"
    | "expire"
    | "block"
    | "unblock"
    | null;


interface ManageUserSubscriptionProps {
    user: UserDetails;

    onSuccess: () =>
        | void
        | Promise<void>;
}


export function ManageUserSubscription({
                                           user,
                                           onSuccess,
                                       }: ManageUserSubscriptionProps) {
    const [
        openModal,
        setOpenModal,
    ] =
        useState<OpenModal>(
            null
        );

    const {
        status,
        actions,
    } =
        useManageUserSubscription({
            userId:
            user.id,

            onSuccess,
        });

    const subscription =
        user.subscription;

    const isBlocked =
        subscription?.status ===
        "blocked";

    const isExpired =
        !subscription ||
        subscription.status ===
        "expired" ||
        new Date(
            subscription.expiresAt
        ).getTime() <=
        Date.now();

    const hasActiveSubscription =
        Boolean(
            subscription &&
            subscription.status ===
            "active" &&
            !isExpired
        );


    const closeModal = (): void => {
        if (!status.isLoading) {
            setOpenModal(null);
        }
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                            <CardTitle>
                                Управление подпиской
                            </CardTitle>

                            <CardDescription>
                                Ручное управление доступом пользователя к VPN
                            </CardDescription>
                        </div>

                        <SubscriptionStatusBadge
                            hasSubscription={
                                Boolean(
                                    subscription
                                )
                            }
                            isActive={
                                hasActiveSubscription
                            }
                            isBlocked={
                                isBlocked
                            }
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    {status.errorMessage && (
                        <div
                            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            role="alert"
                        >
                            {
                                status.errorMessage
                            }
                        </div>
                    )}

                    <p className="text-sm leading-6 text-slate-600">
                        {!subscription
                            ? "У пользователя пока нет подписки. Вы можете выдать её вручную."
                            : isBlocked
                                ? "Подписка заблокирована администратором. Срок действия при этом сохраняется."
                                : hasActiveSubscription
                                    ? "Подписка активна. Её можно продлить, завершить или заблокировать."
                                    : "Срок подписки истёк. Вы можете возобновить её, добавив новый период."}
                    </p>
                </CardContent>

                <CardFooter className="flex-wrap">
                    <Button
                        disabled={
                            status.isLoading
                        }
                        leftIcon={
                            <CalendarPlus className="size-4" />
                        }
                        onClick={() => {
                            actions.clearError();
                            setOpenModal(
                                "extend"
                            );
                        }}
                    >
                        {!subscription
                            ? "Выдать подписку"
                            : isExpired
                                ? "Возобновить"
                                : "Продлить"}
                    </Button>

                    {hasActiveSubscription && (
                        <>
                            <Button
                                disabled={
                                    status.isLoading
                                }
                                leftIcon={
                                    <Ban className="size-4" />
                                }
                                onClick={() => {
                                    actions.clearError();
                                    setOpenModal(
                                        "block"
                                    );
                                }}
                                variant="outline"
                            >
                                Заблокировать
                            </Button>

                            <Button
                                disabled={
                                    status.isLoading
                                }
                                leftIcon={
                                    <CircleX className="size-4" />
                                }
                                onClick={() => {
                                    actions.clearError();
                                    setOpenModal(
                                        "expire"
                                    );
                                }}
                                variant="danger"
                            >
                                Завершить
                            </Button>
                        </>
                    )}

                    {isBlocked && (
                        <>
                            <Button
                                disabled={
                                    status.isLoading
                                }
                                leftIcon={
                                    <ShieldCheck className="size-4" />
                                }
                                onClick={() => {
                                    actions.clearError();
                                    setOpenModal(
                                        "unblock"
                                    );
                                }}
                                variant="secondary"
                            >
                                Разблокировать
                            </Button>

                            <Button
                                disabled={
                                    status.isLoading
                                }
                                leftIcon={
                                    <CircleX className="size-4" />
                                }
                                onClick={() => {
                                    actions.clearError();
                                    setOpenModal(
                                        "expire"
                                    );
                                }}
                                variant="danger"
                            >
                                Завершить
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>

            <ExtendSubscriptionModal
                hasSubscription={
                    Boolean(
                        subscription
                    )
                }
                isLoading={
                    status.activeAction ===
                    "extend"
                }
                isOpen={
                    openModal ===
                    "extend"
                }
                onClose={
                    closeModal
                }
                onSubmit={
                    actions.extendSubscription
                }
            />

            <ConfirmSubscriptionActionModal
                confirmLabel="Завершить подписку"
                description="Подписка будет завершена немедленно, а VPN-доступ пользователя будет отозван."
                isLoading={
                    status.activeAction ===
                    "expire"
                }
                isOpen={
                    openModal ===
                    "expire"
                }
                onClose={
                    closeModal
                }
                onConfirm={
                    actions.expireSubscription
                }
                title="Завершить подписку?"
                variant="danger"
            />

            <ConfirmSubscriptionActionModal
                confirmLabel="Заблокировать"
                description="VPN-доступ будет отозван, но оставшийся срок подписки сохранится."
                isLoading={
                    status.activeAction ===
                    "block"
                }
                isOpen={
                    openModal ===
                    "block"
                }
                onClose={
                    closeModal
                }
                onConfirm={
                    actions.blockSubscription
                }
                title="Заблокировать подписку?"
                variant="danger"
            />

            <ConfirmSubscriptionActionModal
                confirmLabel="Разблокировать"
                description="Если срок подписки ещё действует, VPN-доступ пользователя будет восстановлен."
                isLoading={
                    status.activeAction ===
                    "unblock"
                }
                isOpen={
                    openModal ===
                    "unblock"
                }
                onClose={
                    closeModal
                }
                onConfirm={
                    actions.unblockSubscription
                }
                title="Разблокировать подписку?"
                variant="primary"
            />
        </>
    );
}


interface SubscriptionStatusBadgeProps {
    hasSubscription: boolean;
    isActive: boolean;
    isBlocked: boolean;
}


function SubscriptionStatusBadge({
                                     hasSubscription,
                                     isActive,
                                     isBlocked,
                                 }: SubscriptionStatusBadgeProps) {
    if (!hasSubscription) {
        return (
            <Badge variant="default">
                Нет подписки
            </Badge>
        );
    }

    if (isBlocked) {
        return (
            <Badge variant="danger">
                Заблокирована
            </Badge>
        );
    }

    if (isActive) {
        return (
            <Badge variant="success">
                <CircleCheck className="mr-1 size-3.5" />
                Активна
            </Badge>
        );
    }

    return (
        <Badge variant="warning">
            Истекла
        </Badge>
    );
}