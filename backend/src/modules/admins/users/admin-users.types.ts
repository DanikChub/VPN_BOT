export type AdminUsersSubscriptionFilter =
    | "all"
    | "active"
    | "expired"
    | "blocked"
    | "none";

export type AdminUsersSortBy =
    | "id"
    | "createdAt"
    | "username"
    | "firstName";

export type SortDirection =
    | "asc"
    | "desc";

export interface GetAdminUsersInput {
    page: number;
    limit: number;

    search?: string;

    subscriptionStatus:
        AdminUsersSubscriptionFilter;

    sortBy: AdminUsersSortBy;
    sortDirection: SortDirection;
}

export interface AdminUsersPagination {
    page: number;
    limit: number;

    totalItems: number;
    totalPages: number;

    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface AdminUserSubscriptionData {
    id: number;
    status: "active" | "expired" | "blocked";
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdminUserListItem {
    id: number;

    telegramId: string;
    username: string | null;
    firstName: string | null;

    balanceAmount: number;

    subscription:
        AdminUserSubscriptionData | null;

    hasActiveSubscription: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface GetAdminUsersResult {
    users: AdminUserListItem[];

    pagination: AdminUsersPagination;

    filters: {
        search: string | null;

        subscriptionStatus:
            AdminUsersSubscriptionFilter;

        sortBy: AdminUsersSortBy;
        sortDirection: SortDirection;
    };
}