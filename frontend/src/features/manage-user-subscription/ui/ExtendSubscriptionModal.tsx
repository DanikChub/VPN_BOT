import {
    useEffect,
    useState,
} from "react";

import {
    CalendarPlus,
} from "lucide-react";

import {
    Button,
    Input,
    Modal,
} from "@/shared/ui";


interface ExtendSubscriptionModalProps {
    isOpen: boolean;
    isLoading: boolean;

    hasSubscription: boolean;

    onClose: () => void;

    onSubmit: (
        durationDays: number
    ) => Promise<boolean>;
}


const DEFAULT_DURATION_DAYS = 30;
const MAX_DURATION_DAYS = 3650;


export function ExtendSubscriptionModal({
                                            isOpen,
                                            isLoading,
                                            hasSubscription,
                                            onClose,
                                            onSubmit,
                                        }: ExtendSubscriptionModalProps) {
    const [
        durationDays,
        setDurationDays,
    ] =
        useState(
            String(
                DEFAULT_DURATION_DAYS
            )
        );

    const [
        errorMessage,
        setErrorMessage,
    ] =
        useState<string | null>(
            null
        );


    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setDurationDays(
            String(
                DEFAULT_DURATION_DAYS
            )
        );

        setErrorMessage(null);
    }, [
        isOpen,
    ]);


    const handleSubmit =
        async (): Promise<void> => {
            const parsedDays =
                Number(
                    durationDays
                );

            if (
                !Number.isInteger(parsedDays) ||
                parsedDays < 1 ||
                parsedDays >
                MAX_DURATION_DAYS
            ) {
                setErrorMessage(
                    `Укажите целое число от 1 до ${MAX_DURATION_DAYS}`
                );

                return;
            }

            setErrorMessage(null);

            const isSuccessful =
                await onSubmit(
                    parsedDays
                );

            if (isSuccessful) {
                onClose();
            }
        };


    return (
        <Modal
            closeOnBackdrop={
                !isLoading
            }
            description={
                hasSubscription
                    ? "Указанное количество дней будет добавлено к текущему сроку подписки."
                    : "Пользователю будет создана активная подписка на указанный срок."
            }
            footer={
                <>
                    <Button
                        disabled={isLoading}
                        onClick={onClose}
                        variant="outline"
                    >
                        Отмена
                    </Button>

                    <Button
                        isLoading={isLoading}
                        leftIcon={
                            <CalendarPlus className="size-4" />
                        }
                        onClick={() => {
                            void handleSubmit();
                        }}
                    >
                        {hasSubscription
                            ? "Продлить"
                            : "Выдать"}
                    </Button>
                </>
            }
            isOpen={isOpen}
            onClose={onClose}
            title={
                hasSubscription
                    ? "Продлить подписку"
                    : "Выдать подписку"
            }
        >
            <Input
                autoFocus
                disabled={isLoading}
                error={
                    errorMessage ??
                    undefined
                }
                hint="Обычно используются периоды 7, 30, 90 или 365 дней"
                label="Количество дней"
                max={
                    MAX_DURATION_DAYS
                }
                min={1}
                onChange={(event) => {
                    setDurationDays(
                        event.target.value
                    );
                }}
                onKeyDown={(event) => {
                    if (
                        event.key ===
                        "Enter"
                    ) {
                        event.preventDefault();

                        void handleSubmit();
                    }
                }}
                type="number"
                value={durationDays}
            />
        </Modal>
    );
}