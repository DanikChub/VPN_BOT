import {
    type HTMLAttributes,
    type TableHTMLAttributes,
    type TdHTMLAttributes,
    type ThHTMLAttributes,
} from "react";

import {
    cn,
} from "@/shared/lib";

export function TableContainer({
                                   className,
                                   ...props
                               }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-slate-200 bg-white",
                className
            )}
            {...props}
        />
    );
}

export function Table({
                          className,
                          ...props
                      }: TableHTMLAttributes<HTMLTableElement>) {
    return (
        <div className="overflow-x-auto">
            <table
                className={cn(
                    "w-full border-collapse text-left text-sm",
                    className
                )}
                {...props}
            />
        </div>
    );
}

export function TableHeader({
                                className,
                                ...props
                            }: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <thead
            className={cn(
                "bg-slate-50",
                className
            )}
            {...props}
        />
    );
}

export function TableBody({
                              className,
                              ...props
                          }: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tbody
            className={cn(
                "divide-y divide-slate-200",
                className
            )}
            {...props}
        />
    );
}

export function TableRow({
                             className,
                             ...props
                         }: HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr
            className={cn(
                "transition hover:bg-slate-50",
                className
            )}
            {...props}
        />
    );
}

export function TableHead({
                              className,
                              ...props
                          }: ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            className={cn(
                "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
                className
            )}
            {...props}
        />
    );
}

export function TableCell({
                              className,
                              ...props
                          }: TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <td
            className={cn(
                "whitespace-nowrap px-4 py-4 text-slate-700",
                className
            )}
            {...props}
        />
    );
}