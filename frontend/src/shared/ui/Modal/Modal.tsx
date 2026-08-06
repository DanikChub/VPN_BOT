
import {type ReactNode, useEffect} from "react";
import {X} from "lucide-react";

import {
    cn,
} from "@/shared/lib";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;

    title?: string;
    description?: string;

    children: ReactNode;
    footer?: ReactNode;

    className?: string;

    closeOnBackdrop?: boolean;
}

export function Modal({
                          isOpen,
                          onClose,

                          title,
                          description,

                          children,
                          footer,

                          className,

                          closeOnBackdrop = true,
                      }: ModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.body.style.overflow =
                previousOverflow;
        };
    }, [
        isOpen,
        onClose,
    ]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
        >
            <button
                aria-label="Закрыть модальное окно"
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                onClick={
                    closeOnBackdrop
                        ? onClose
                        : undefined
                }
                type="button"
            />

            <div
                className={cn(
                    "relative z-10 max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
                    className
                )}
            >
                {(title || description) && (
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                        <div>
                            {title && (
                                <h2 className="text-lg font-semibold text-slate-950">
                                    {title}
                                </h2>
                            )}

                            {description && (
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        <button
                            aria-label="Закрыть"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            onClick={onClose}
                            type="button"
                        >
                            <X
                                aria-hidden="true"
                                className="size-5"
                            />
                        </button>
                    </div>
                )}

                <div className="max-h-[60vh] overflow-y-auto p-6">
                    {children}
                </div>

                {footer && (
                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}