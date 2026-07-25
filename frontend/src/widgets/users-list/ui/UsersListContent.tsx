import type {SortDirection, UserListItem, UsersSortBy} from "@/entities/user";

import {Card, CardContent, EmptyState, Spinner} from "@/shared/ui";
import {Users} from "lucide-react";
import UsersTable from "@/entities/user";

interface UsersListContentProps {
    users: UserListItem[];
    isLoading: boolean;
    errorMessage: string | null;

    sortBy: UsersSortBy;
    sortDirection: SortDirection;

    onSortChange: (field: UsersSortBy) => void;
}

const UsersListContent = ({
                            users,
                            isLoading,
                            errorMessage,

                            sortBy,
                            sortDirection,

                            onSortChange
                          }: UsersListContentProps) => {
    if (errorMessage) {
        return (
            <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {errorMessage}
            </div>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex min-h-72 items-center justify-center">
                    <Spinner size="lg" />
                </CardContent>
            </Card>
        );
    }

    if (users.length === 0) {
        return (
            <EmptyState
                description="Попробуйте изменить поисковый запрос или выбранный фильтр."
                icon={
                    <Users className="size-6" />
                }
                title="Пользователи не найдены"
            />
        );
    }

    return (
        <UsersTable
            users={users}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
        />
    );
}


export default UsersListContent;