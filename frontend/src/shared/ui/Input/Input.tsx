import {
    forwardRef,
    type InputHTMLAttributes,
    type ReactNode,
} from "react";

import {
    cn,
} from "@/shared/lib";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;

    leftIcon?: ReactNode;
    rightElement?: ReactNode;

    containerClassName?: string;
}

export const Input =
    forwardRef<
        HTMLInputElement,
        InputProps
    >(
        (
            {
                className,
                containerClassName,

                id,
                label,
                error,
                hint,

                leftIcon,
                rightElement,

                disabled,

                ...props
            },
            ref
        ) => {
            return (
                <div
                    className={cn(
                        "space-y-2",
                        containerClassName
                    )}
                >
                    {label && (
                        <label
                            className="block text-sm font-medium text-slate-700"
                            htmlFor={id}
                        >
                            {label}
                        </label>
                    )}

                    <div className="relative">
                        {leftIcon && (
                            <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
                                {leftIcon}
                            </div>
                        )}

                        <input
                            ref={ref}
                            aria-invalid={
                                Boolean(error)
                            }
                            className={cn(
                                "h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition",
                                "placeholder:text-slate-400",
                                "focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10",
                                "disabled:cursor-not-allowed disabled:bg-slate-100",
                                leftIcon &&
                                "pl-10",
                                rightElement &&
                                "pr-11",
                                error
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                                    : "border-slate-300",
                                className
                            )}
                            disabled={disabled}
                            id={id}
                            {...props}
                        />

                        {rightElement && (
                            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
                                {rightElement}
                            </div>
                        )}
                    </div>

                    {error ? (
                        <p className="text-xs text-red-600">
                            {error}
                        </p>
                    ) : hint ? (
                        <p className="text-xs text-slate-500">
                            {hint}
                        </p>
                    ) : null}
                </div>
            );
        }
    );

Input.displayName = "Input";