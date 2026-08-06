import {
    Op,
    cast,
    col,
    where,
    type Includeable,
    type Order,
    type WhereOptions,
} from "sequelize";

import Subscription
    from "../../subscriptions/subscription.model";

import type {
    AdminUsersSortBy,
    AdminUsersSubscriptionFilter,
    SortDirection,
} from "./admin-users.types";


export function buildAdminUsersWhere(
    search: string | undefined,
    subscriptionStatus:
        AdminUsersSubscriptionFilter
): WhereOptions {
    return {
        [Op.and]: [
            buildUserSearchWhere(
                search
            ),

            buildSubscriptionFilterWhere(
                subscriptionStatus
            ),
        ],
    };
}


export function buildAdminUsersInclude(
    subscriptionStatus:
        AdminUsersSubscriptionFilter
): Includeable[] {
    return [
        buildSubscriptionInclude(
            subscriptionStatus
        ),
    ];
}


export function buildAdminUsersOrder(
    sortBy: AdminUsersSortBy,
    sortDirection: SortDirection
): Order {
    const direction =
        sortDirection === "asc"
            ? "ASC"
            : "DESC";

    const columns: Record<
        AdminUsersSortBy,
        string
    > = {
        id: "id",
        createdAt: "created_at",
        username: "username",
        firstName: "first_name",
    };

    return [
        [
            columns[sortBy],
            direction,
        ],

        [
            "id",
            "DESC",
        ],
    ];
}


function buildUserSearchWhere(
    search?: string
): WhereOptions {
    const normalizedSearch =
        search?.trim();

    if (!normalizedSearch) {
        return {};
    }

    return {
        [Op.or]: [
            where(
                cast(
                    col("User.telegram_id"),
                    "TEXT"
                ),
                {
                    [Op.iLike]:
                        `%${normalizedSearch}%`,
                }
            ),

            {
                username: {
                    [Op.iLike]:
                        `%${normalizedSearch}%`,
                },
            },

            {
                firstName: {
                    [Op.iLike]:
                        `%${normalizedSearch}%`,
                },
            },
        ],
    };
}


function buildSubscriptionInclude(
    status:
        AdminUsersSubscriptionFilter
): Includeable {
    const baseInclude = {
        model: Subscription,
        as: "subscription",
        required: false,
    };

    const now = new Date();

    switch (status) {
        case "active":
            return {
                ...baseInclude,
                required: true,

                where: {
                    status: "active",

                    expires_at: {
                        [Op.gt]: now,
                    },
                },
            };

        case "expired":
            return {
                ...baseInclude,
                required: true,

                where: {
                    [Op.or]: [
                        {
                            status: "expired",
                        },

                        {
                            expires_at: {
                                [Op.lte]: now,
                            },
                        },
                    ],
                },
            };

        case "blocked":
            return {
                ...baseInclude,
                required: true,

                where: {
                    status: "blocked",
                },
            };

        default:
            return baseInclude;
    }
}


function buildSubscriptionFilterWhere(
    status:
        AdminUsersSubscriptionFilter
): WhereOptions {
    if (status !== "none") {
        return {};
    }

    return {
        "$subscription.id$": null,
    };
}