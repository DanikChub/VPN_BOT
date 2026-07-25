import {
    type HTMLAttributes,
} from "react";

import {
    cn,
} from "@/shared/lib";

export function Page({
                         className,
                         ...props
                     }: HTMLAttributes<HTMLElement>) {
    return (
        <section
            className={cn(
                "mx-auto w-full max-w-screen-2xl p-6 lg:p-8",
                className
            )}
            {...props}
        />
    );
}

export function PageContent({
                                className,
                                ...props
                            }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "mt-6",
                className
            )}
            {...props}
        />
    );
}