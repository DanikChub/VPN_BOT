import {
    Edit3,
    Trash2,
} from "lucide-react";

import type {
    Plan,
} from "../model";

import {
    Badge,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui";

import {
    formatDate,
    formatMoney,
} from "@/shared/lib";


interface PlansTableProps {
    plans: Plan[];

    isMutating: boolean;

    onEdit: (
        plan: Plan
    ) => void;

    onDelete: (
        plan: Plan
    ) => void;
}


export function PlansTable({
                               plans,
                               isMutating,
                               onEdit,
                               onDelete,
                           }: PlansTableProps) {
    return (
        <TableContainer>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            ID
                        </TableHead>

                        <TableHead>
                            Название
                        </TableHead>

                        <TableHead>
                            Срок
                        </TableHead>

                        <TableHead>
                            Цена
                        </TableHead>

                        <TableHead>
                            Валюта
                        </TableHead>

                        <TableHead>
                            Статус
                        </TableHead>

                        <TableHead>
                            Обновлён
                        </TableHead>

                        <TableHead className="w-28 text-right">
                            Действия
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {plans.map((plan) => (
                        <TableRow key={plan.id}>
                            <TableCell>
                                {plan.id}
                            </TableCell>

                            <TableCell>
                                <div>
                                    <p className="font-medium text-slate-950">
                                        {plan.name}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Создан{" "}
                                        {formatDate(
                                            plan.createdAt
                                        )}
                                    </p>
                                </div>
                            </TableCell>

                            <TableCell>
                                {formatDurationDays(
                                    plan.durationDays
                                )}
                            </TableCell>

                            <TableCell>
                                {formatMoney(
                                    plan.priceAmount
                                )}
                            </TableCell>

                            <TableCell>
                                <span className="font-mono text-xs">
                                    {plan.currency}
                                </span>
                            </TableCell>

                            <TableCell>
                                <Badge
                                    variant={
                                        plan.isActive
                                            ? "success"
                                            : "default"
                                    }
                                >
                                    {plan.isActive
                                        ? "Активен"
                                        : "Выключен"}
                                </Badge>
                            </TableCell>

                            <TableCell>
                                {formatDate(
                                    plan.updatedAt
                                )}
                            </TableCell>

                            <TableCell className="text-right">
                                <div className="inline-flex gap-1">
                                    <Button
                                        aria-label="Редактировать тариф"
                                        disabled={isMutating}
                                        onClick={() => {
                                            onEdit(plan);
                                        }}
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <Edit3 className="size-4" />
                                    </Button>

                                    <Button
                                        aria-label="Удалить тариф"
                                        disabled={isMutating}
                                        onClick={() => {
                                            onDelete(plan);
                                        }}
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <Trash2 className="size-4 text-red-600" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}


function formatDurationDays(
    days: number
): string {
    const lastTwoDigits =
        days % 100;

    const lastDigit =
        days % 10;

    if (
        lastTwoDigits >= 11 &&
        lastTwoDigits <= 14
    ) {
        return `${days} дней`;
    }

    if (lastDigit === 1) {
        return `${days} день`;
    }

    if (
        lastDigit >= 2 &&
        lastDigit <= 4
    ) {
        return `${days} дня`;
    }

    return `${days} дней`;
}