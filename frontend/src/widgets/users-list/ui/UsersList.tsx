import {
    useNavigate,
} from "react-router-dom";

import {
    getUserDetailsPath,
} from "@/shared/config/routePaths";

import useUsersList from "@/widgets/users-list/model";
import UsersFilters from "@/features/filter-users";
import UsersPagination from "@/features/paginate-users";
import UsersListContent from "@/widgets/users-list/ui/UsersListContent.tsx";

export function UsersList() {
    const navigate = useNavigate();

    const {
        users,
        pagination,
        filters,
        sorting,
        status,
        actions,
    } = useUsersList();

    const openUser = (
        userId: number
    ): void => {
        navigate(
            getUserDetailsPath(userId)
        );
    };
    return (
        <div className="space-y-5">
            <UsersFilters
                search={filters.search}
                subscriptionStatus={
                    filters.subscriptionStatus
                }
                onSearchChange={
                    actions.changeSearch
                }
                onSubscriptionStatusChange={
                    actions.changeSubscriptionStatus
                }
            />

            <UsersListContent
                users={users}
                isLoading={status.isLoading}
                errorMessage={status.errorMessage}
                sortBy={sorting.sortBy}
                sortDirection={
                    sorting.sortDirection
                }
                onSortChange={
                    actions.changeSort
                }
                onOpenUser={
                    openUser
                }
            />

            {pagination && (
                <UsersPagination
                    pagination={pagination}
                    isLoading={status.isLoading}
                    onNextPage={
                        actions.goToNextPage
                    }
                    onPreviousPage={
                        actions.goToPreviousPage
                    }
                />
            )}
        </div>
    );
}