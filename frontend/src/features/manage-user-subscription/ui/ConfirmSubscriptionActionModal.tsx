import {
    AlertTriangle,
} from "lucide-react";

import {
    Button,
    Modal,
} from "@/shared/ui";


interface ConfirmSubscriptionActionModalProps {
    isOpen: boolean;
    isLoading: boolean;

    title: string;
    description: string;
    confirmLabel: string;

    variant?:
        | "primary"
        | "danger";

    onClose: () => void;

    onConfirm: () =>
        Promise<boolean>;
}


export function ConfirmSubscriptionActionModal({
                                                   isOpen,
                                                   isLoading,
                                                   title,
                                                   description,
                                                   confirmLabel,
                                                   variant = "danger",
                                                   onClose,
                                                   onConfirm,
                                               }: ConfirmSubscriptionActionModalProps) {
    const handleConfirm =
        async (): Promise<void> => {
            const isSuccessful =
                await onConfirm();

            if (isSuccessful) {
                onClose();
            }
        };


    return (
        <Modal
            closeOnBackdrop={
                !isLoading
            }
            description={description}
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
                        onClick={() => {
                            void handleConfirm();
                        }}
                        variant={variant}
                    >
                        {confirmLabel}
                    </Button>
                </>
            }
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />

                <p className="text-sm leading-6 text-amber-800">
                    Действие изменит доступ пользователя к VPN.
                </p>
            </div>
        </Modal>
    );
}