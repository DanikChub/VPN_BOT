import {
    AlertTriangle,
    Trash2,
} from "lucide-react";

import type {
    Plan,
} from "@/entities/plan";

import {
    Button,
    Modal,
} from "@/shared/ui";


interface DeletePlanModalProps {
    isOpen: boolean;
    isLoading: boolean;

    plan:
        | Plan
        | null;

    onClose: () => void;

    onConfirm: (
        planId: number
    ) => Promise<boolean>;
}


export function DeletePlanModal({
                                    isOpen,
                                    isLoading,
                                    plan,
                                    onClose,
                                    onConfirm,
                                }: DeletePlanModalProps) {
    const handleConfirm =
        async (): Promise<void> => {
            if (!plan) {
                return;
            }

            const isSuccessful =
                await onConfirm(
                    plan.id
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
                plan
                    ? `Тариф «${plan.name}» будет удалён без возможности восстановления.`
                    : undefined
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
                            <Trash2 className="size-4" />
                        }
                        onClick={() => {
                            void handleConfirm();
                        }}
                        variant="danger"
                    >
                        Удалить тариф
                    </Button>
                </>
            }
            isOpen={isOpen}
            onClose={onClose}
            title="Удалить тариф?"
        >
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />

                <p className="text-sm leading-6 text-amber-800">
                    Тариф нельзя удалить, если по нему уже существуют заказы. В таком случае выключите его через редактирование.
                </p>
            </div>
        </Modal>
    );
}