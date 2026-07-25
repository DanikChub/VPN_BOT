import {
    cn,
} from "@/shared/lib";

type SpinnerSize =
    | "sm"
    | "md"
    | "lg";

interface SpinnerProps {
    size?: SpinnerSize;
    className?: string;
}

const sizeClasses: Record<
    SpinnerSize,
    string
> = {
    sm:
        "size-4 border-2",

    md:
        "size-6 border-2",

    lg:
        "size-10 border-4",
};

export function Spinner({
                            size = "md",
                            className,
                        }: SpinnerProps) {
    return (
        <span
            aria-label="Загрузка"
            className={cn(
                "inline-block animate-spin rounded-full border-current border-t-transparent text-slate-950",
                sizeClasses[size],
                className
            )}
            role="status"
        />
    );
}