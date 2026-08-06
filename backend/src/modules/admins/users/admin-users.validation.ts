import type {
    AdminUsersSortBy,
    AdminUsersSubscriptionFilter,
    GetAdminUsersInput,
    SortDirection,
} from "./admin-users.types";


const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const allowedSubscriptionStatuses:
    AdminUsersSubscriptionFilter[] = [
    "all",
    "active",
    "expired",
    "blocked",
    "none",
];

const allowedSortFields:
    AdminUsersSortBy[] = [
    "id",
    "createdAt",
    "username",
    "firstName",
];

const allowedSortDirections:
    SortDirection[] = [
    "asc",
    "desc",
];


function parsePositiveInteger(
    value: unknown,
    fallback: number
): number {
    if (typeof value !== "string") {
        return fallback;
    }

    const parsed = Number.parseInt(
        value,
        10
    );

    return (
        Number.isInteger(parsed) &&
        parsed > 0
    )
        ? parsed
        : fallback;
}


function parseOptionalString(
    value: unknown
): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    return value.trim() || undefined;
}


function parseAllowedValue<T extends string>(
    value: unknown,
    allowedValues: readonly T[],
    fallback: T
): T {
    if (
        typeof value === "string" &&
        allowedValues.includes(
            value as T
        )
    ) {
        return value as T;
    }

    return fallback;
}


export function parseAdminUsersQuery(
    query: Record<string, unknown>
): GetAdminUsersInput {
    return {
        page: parsePositiveInteger(
            query.page,
            DEFAULT_PAGE
        ),

        limit: parsePositiveInteger(
            query.limit,
            DEFAULT_LIMIT
        ),

        search: parseOptionalString(
            query.search
        ),

        subscriptionStatus:
            parseAllowedValue(
                query.subscriptionStatus,
                allowedSubscriptionStatuses,
                "all"
            ),

        sortBy:
            parseAllowedValue(
                query.sortBy,
                allowedSortFields,
                "createdAt"
            ),

        sortDirection:
            parseAllowedValue(
                query.sortDirection,
                allowedSortDirections,
                "desc"
            ),
    };
}


export function parseAdminUserId(
    value: unknown
): number {
    if (typeof value !== "string") {
        throw new Error(
            "Invalid user id"
        );
    }

    const userId = Number.parseInt(
        value,
        10
    );

    if (
        !Number.isInteger(userId) ||
        userId < 1
    ) {
        throw new Error(
            "Invalid user id"
        );
    }

    return userId;
}


export function parseDurationDays(
    value: unknown
): number {
    if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 1
    ) {
        throw new Error(
            "durationDays must be a positive integer"
        );
    }

    return value;
}