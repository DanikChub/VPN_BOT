import { useEffect, useState } from "react";

import {
    type SortDirection,
    userApi,
    type UserListItem,
    type UsersPaginationInterface,
    type UsersSortBy,
    type UserSubscriptionFilter,
} from "@/entities/user";

import { getApiErrorMessage } from "@/shared/api";

const USERS_LIMIT = 20;
const SEARCH_DEBOUNCE_DELAY = 400;

const useUsersList = () => {
    const [users, setUsers] =
        useState<UserListItem[]>([]);

    const [pagination, setPagination] =
        useState<UsersPaginationInterface | null>(null);

    const [page, setPage] =
        useState(1);

    const [search, setSearch] =
        useState("");

    const [debouncedSearch, setDebouncedSearch] =
        useState("");

    const [
        subscriptionStatus,
        setSubscriptionStatus,
    ] =
        useState<UserSubscriptionFilter>("all");

    const [sortBy, setSortBy] =
        useState<UsersSortBy>("createdAt");

    const [
        sortDirection,
        setSortDirection,
    ] =
        useState<SortDirection>("desc");

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(
            () => {
                setDebouncedSearch(
                    search.trim()
                );

                setPage(1);
            },
            SEARCH_DEBOUNCE_DELAY
        );

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [search]);

    useEffect(() => {
        let isCancelled = false;

        async function loadUsers(): Promise<void> {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const result =
                    await userApi.getAll({
                        page,
                        limit: USERS_LIMIT,
                        search:
                            debouncedSearch ||
                            undefined,
                        subscriptionStatus,
                        sortBy,
                        sortDirection,
                    });

                if (isCancelled) {
                    return;
                }

                setUsers(result.users);
                setPagination(
                    result.pagination
                );
            } catch (error: unknown) {
                if (isCancelled) {
                    return;
                }

                setErrorMessage(
                    getApiErrorMessage(error)
                );
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadUsers();

        return () => {
            isCancelled = true;
        };
    }, [
        page,
        debouncedSearch,
        subscriptionStatus,
        sortBy,
        sortDirection,
    ]);

    const changeSearch = (
        value: string
    ): void => {
        setSearch(value);
    };

    const changeSubscriptionStatus = (
        value: UserSubscriptionFilter
    ): void => {
        setSubscriptionStatus(value);
        setPage(1);
    };

    const changeSort = (
        nextSortBy: UsersSortBy
    ): void => {
        setPage(1);

        if (nextSortBy === sortBy) {
            setSortDirection(
                (current) =>
                    current === "asc"
                        ? "desc"
                        : "asc"
            );

            return;
        }

        setSortBy(nextSortBy);
        setSortDirection("asc");
    };

    const goToNextPage = (): void => {
        setPage((current) => {
            if (
                pagination &&
                current >= pagination.totalPages
            ) {
                return current;
            }

            return current + 1;
        });
    };

    const goToPreviousPage = (): void => {
        setPage((current) =>
            Math.max(1, current - 1)
        );
    };

    return {
        users,
        pagination,

        filters: {
            search,
            subscriptionStatus,
        },

        sorting: {
            sortBy,
            sortDirection,
        },

        status: {
            isLoading,
            errorMessage,
        },

        actions: {
            changeSearch,
            changeSubscriptionStatus,
            changeSort,
            goToNextPage,
            goToPreviousPage,
        },
    };
};

export default useUsersList;