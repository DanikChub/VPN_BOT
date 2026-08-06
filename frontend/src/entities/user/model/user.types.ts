export type UserSubscriptionStatus =
    | "active"
    | "expired"
    | "blocked";

export type UserSubscriptionFilter =
    | "all"
    | "active"
    | "expired"
    | "blocked"
    | "none";

export type UsersSortBy =
    | "id"
    | "createdAt"
    | "username"
    | "firstName";

export type SortDirection =
    | "asc"
    | "desc";

export interface UserSubscription {
    id: number;

    status: UserSubscriptionStatus;

    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserSubscriptionDetails
    extends UserSubscription {
    userId: number;
}

export interface UserListItem {
    id: number;

    telegramId: string;

    username: string | null;
    firstName: string | null;

    balanceAmount: number;

    subscription:
        UserSubscription | null;

    hasActiveSubscription: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface UsersPaginationInterface {
    page: number;
    limit: number;

    totalItems: number;
    totalPages: number;

    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface UsersFiltersInterface {
    search: string | null;

    subscriptionStatus:
        UserSubscriptionFilter;

    sortBy: UsersSortBy;
    sortDirection: SortDirection;
}

export interface GetUsersResponse {
    users: UserListItem[];

    pagination: UsersPaginationInterface;

    filters: UsersFiltersInterface;
}

export interface GetUsersParams {
    page?: number;
    limit?: number;

    search?: string;

    subscriptionStatus?:
        UserSubscriptionFilter;

    sortBy?: UsersSortBy;
    sortDirection?: SortDirection;
}

export interface UserDetails {
    id: number;

    telegramId: string;

    username: string | null;
    firstName: string | null;

    balanceAmount: number;

    subscription:
        UserSubscription | null;

    createdAt: string;
    updatedAt: string;
}


export interface GetUserByIdResponse {
    user: UserDetails;
}


export interface ExtendUserSubscriptionPayload {
    durationDays: number;
}


export interface UserSubscriptionMutationResponse {
    subscription:
        UserSubscriptionDetails;
}