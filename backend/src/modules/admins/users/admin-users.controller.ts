import type {
    NextFunction,
    Request,
    Response,
} from "express";

import adminUsersService from "./admin-users.service";

import type {
    AdminUsersSortBy,
    AdminUsersSubscriptionFilter,
    SortDirection,
} from "./admin-users.types";

const allowedSubscriptionStatuses:
    AdminUsersSubscriptionFilter[] = [
    "all",
    "active",
    "expired",
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

    if (
        !Number.isInteger(parsed) ||
        parsed < 1
    ) {
        return fallback;
    }

    return parsed;
}

function parseSearch(
    value: unknown
): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const search = value.trim();

    return search || undefined;
}

function parseSubscriptionStatus(
    value: unknown
): AdminUsersSubscriptionFilter {
    if (
        typeof value === "string" &&
        allowedSubscriptionStatuses.includes(
            value as AdminUsersSubscriptionFilter
        )
    ) {
        return value as AdminUsersSubscriptionFilter;
    }

    return "all";
}

function parseSortBy(
    value: unknown
): AdminUsersSortBy {
    if (
        typeof value === "string" &&
        allowedSortFields.includes(
            value as AdminUsersSortBy
        )
    ) {
        return value as AdminUsersSortBy;
    }

    return "createdAt";
}

function parseSortDirection(
    value: unknown
): SortDirection {
    if (
        typeof value === "string" &&
        allowedSortDirections.includes(
            value as SortDirection
        )
    ) {
        return value as SortDirection;
    }

    return "desc";
}

class AdminUsersController {
    async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result =
                await adminUsersService.getAll({
                    page: parsePositiveInteger(
                        req.query.page,
                        1
                    ),

                    limit: parsePositiveInteger(
                        req.query.limit,
                        20
                    ),

                    search: parseSearch(
                        req.query.search
                    ),

                    subscriptionStatus:
                        parseSubscriptionStatus(
                            req.query
                                .subscriptionStatus
                        ),

                    sortBy: parseSortBy(
                        req.query.sortBy
                    ),

                    sortDirection:
                        parseSortDirection(
                            req.query
                                .sortDirection
                        ),
                });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

const adminUsersController =
    new AdminUsersController();

export default adminUsersController;