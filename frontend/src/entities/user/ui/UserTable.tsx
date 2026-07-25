import type {SortDirection, UserListItem, UsersSortBy} from "@/entities/user";
import {Button, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow} from "@/shared/ui";
import {UserSubscriptionBadge} from "@/entities/user";
import {formatDate, formatMoney} from "@/shared/lib";
import {ArrowDown, ArrowUp, ChevronsUpDown, Eye} from "lucide-react";

interface UsersTableProps {
    users: UserListItem[];

    sortBy: UsersSortBy;
    sortDirection: SortDirection;

    onSortChange: (
        sortBy: UsersSortBy
    ) => void;
}

export function UsersTable({
                               users,
                               sortBy,
                               sortDirection,
                               onSortChange,
                           }: UsersTableProps) {
    return (
        <TableContainer>
            <Table>
                <TableHeader>
                    <TableRow>
                        <SortableHead
                            currentField={sortBy}
                            direction={sortDirection}
                            field="id"
                            onClick={onSortChange}
                            title="ID"
                        />

                        <SortableHead
                            currentField={sortBy}
                            direction={sortDirection}
                            field="firstName"
                            onClick={onSortChange}
                            title="Пользователь"
                        />

                        <TableHead>
                            Telegram ID
                        </TableHead>

                        <TableHead>
                            Баланс
                        </TableHead>

                        <TableHead>
                            Подписка
                        </TableHead>

                        <TableHead>
                            Действует до
                        </TableHead>

                        <SortableHead
                            currentField={sortBy}
                            direction={sortDirection}
                            field="createdAt"
                            onClick={onSortChange}
                            title="Регистрация"
                        />

                        <TableHead className="w-16 text-right">
                            Действия
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                {user.id}
                            </TableCell>

                            <TableCell>
                                <div>
                                    <p className="font-medium text-slate-950">
                                        {user.firstName || "Без имени"}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {user.username
                                            ? `@${user.username}`
                                            : "Username отсутствует"}
                                    </p>
                                </div>
                            </TableCell>

                            <TableCell>
                                <span className="font-mono text-xs">
                                    {user.telegramId}
                                </span>
                            </TableCell>

                            <TableCell>
                                {formatMoney(
                                    user.balanceAmount
                                )}
                            </TableCell>

                            <TableCell>
                                <UserSubscriptionBadge
                                    user={user}
                                />
                            </TableCell>

                            <TableCell>
                                {formatDate(
                                    user.subscription?.expiresAt
                                )}
                            </TableCell>

                            <TableCell>
                                {formatDate(
                                    user.createdAt
                                )}
                            </TableCell>

                            <TableCell className="text-right">
                                <Button
                                    aria-label="Открыть пользователя"
                                    size="icon"
                                    variant="ghost"
                                >
                                    <Eye className="size-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

interface SortableHeadProps {
    title: string;

    field: UsersSortBy;
    currentField: UsersSortBy;

    direction: SortDirection;

    onClick: (
        field: UsersSortBy
    ) => void;

    className?: string;
}

function SortableHead({
                          title,
                          field,
                          currentField,
                          direction,
                          onClick,
                          className,
                      }: SortableHeadProps) {
    const isActive =
        field === currentField;

    return (
        <TableHead className={className}>
            <button
                className="inline-flex items-center gap-1.5 rounded-md text-left font-medium text-slate-600 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                onClick={() => {
                    onClick(field);
                }}
                type="button"
            >
                <span>{title}</span>

                {isActive
                    ? (
                        direction === "asc"
                            ? (
                                <ArrowUp
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                            )
                            : (
                                <ArrowDown
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                            )
                    )
                    : (
                        <ChevronsUpDown
                            aria-hidden="true"
                            className="size-3.5 text-slate-400"
                        />
                    )}
            </button>
        </TableHead>
    );
}