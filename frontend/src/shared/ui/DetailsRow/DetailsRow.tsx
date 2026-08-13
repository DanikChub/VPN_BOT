interface DetailsRowProps {
    label: string;

    value:
        | string
        | number;

    monospace?: boolean;
}


const DetailsRow = ({
                        label,
                        value,
                        monospace = false,
                    }: DetailsRowProps) => {
    return (
        <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
            <span className="text-sm text-slate-500">
                {label}
            </span>

            <span
                className={
                    monospace
                        ? "break-all text-right font-mono text-sm text-slate-950"
                        : "text-right text-sm font-medium text-slate-950"
                }
            >
                {value}
            </span>
        </div>
    );
};


export default DetailsRow;