import {
    TriangleAlert,
} from "lucide-react";

import {
    Button,
} from "@/shared/ui/Button";

import {
    Modal,
} from "@/shared/ui/Modal";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;

    title?: string;
    description?: string;

    confirmText?: string;
    cancelText?: string;

    isLoading?: boolean;
    variant?: "default" | "danger";
}

export function ConfirmDialog({
                                  isOpen,
                                  onClose,
                                  onConfirm,

                                  title = "Подтвердите действие",
                                  description =
                                      "Вы уверены, что хотите продолжить?",

                                  confirmText = "Подтвердить",
                                  cancelText = "Отмена",

                                  isLoading = false,
                                  variant = "default",
                              }: ConfirmDialogProps) {
    return (
        <Modal
            footer={
                <>
                    <Button
                        disabled={isLoading}
                        onClick={onClose}
                        variant="secondary"
                    >
                        {cancelText}
                    </Button>

                    <Button
                        isLoading={isLoading}
                        onClick={onConfirm}
                        variant={
                            variant ===
                            "danger"
                                ? "danger"
                                : "primary"
                        }
                    >
                        {confirmText}
                    </Button>
                </>
            }
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="flex gap-4">
                <div
                    className={
                        variant === "danger"
                            ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600"
                            : "flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
                    }
                >
                    <TriangleAlert
                        aria-hidden="true"
                        className="size-5"
                    />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                        {title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </Modal>
    );
}