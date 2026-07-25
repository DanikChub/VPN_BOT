import {
    type ReactNode,
} from "react";

import {
    cn,
} from "@/shared/lib";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
                               title,
                               description,
                               icon,
                               action,
                               className,
                           }: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center",
                className
            )}
        >
            {icon && (
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    {icon}
                </div>
            )}

            <h2 className="text-base font-semibold text-slate-950">
                {title}
            </h2>

            {description && (
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-5">
                    {action}
                </div>
            )}
        </div>
    );
}