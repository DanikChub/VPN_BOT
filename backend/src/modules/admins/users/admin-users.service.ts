import {
    Op,
    type Includeable,
    type Order,
    type WhereOptions, where, cast, col,
} from "sequelize";

import User from "../../users/user.model";
import Subscription from "../../subscriptions/subscription.model";

import type {
    AdminUserListItem,
    AdminUsersSortBy,
    AdminUsersSubscriptionFilter,
    GetAdminUsersInput,
    GetAdminUsersResult,
    SortDirection,
} from "./admin-users.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function normalizePositiveInteger(
    value: number,
    fallback: number
): number {
    if (
        !Number.isInteger(value) ||
        value < 1
    ) {
        return fallback;
    }

    return value;
}

function buildUserWhere(
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

function buildOrder(
    sortBy: AdminUsersSortBy,
    sortDirection: SortDirection
): Order {
    const direction =
        sortDirection === "asc"
            ? "ASC"
            : "DESC";

    const sortColumnMap: Record<
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
            sortColumnMap[sortBy],
            direction,
        ],

        /*
         * Если у нескольких пользователей одинаковое
         * значение сортировки, id обеспечивает
         * стабильный порядок.
         */
        ["id", "DESC"],
    ];
}

function buildSubscriptionInclude(
    subscriptionStatus:
        AdminUsersSubscriptionFilter
): Includeable {
    const now = new Date();

    const baseInclude = {
        model: Subscription,
        as: "subscription",
        required: false,
    };

    switch (subscriptionStatus) {
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

        case "none":
        case "all":
        default:
            return baseInclude;
    }
}

function buildSubscriptionFilterWhere(
    subscriptionStatus:
        AdminUsersSubscriptionFilter
): WhereOptions {
    if (subscriptionStatus !== "none") {
        return {};
    }

    /*
     * Sequelize обращается к колонке связанной модели
     * через синтаксис $alias.field$.
     */
    return {
        "$subscription.id$": null,
    };
}

function isSubscriptionActive(
    subscription: Subscription | null
): boolean {
    if (!subscription) {
        return false;
    }

    if (subscription.status !== "active") {
        return false;
    }

    if (!subscription.expires_at) {
        return false;
    }

    return (
        subscription.expires_at.getTime() >
        Date.now()
    );
}

function mapUserToListItem(
    user: User
): AdminUserListItem {
    const userWithSubscription =
        user as User & {
            subscription?: Subscription | null;
        };

    const subscription =
        userWithSubscription.subscription ?? null;

    return {
        id: user.id,

        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,

        balanceAmount:
            Number(user.balance_amount),

        subscription: subscription
            ? {
                id: subscription.id,
                status: subscription.status,
                expiresAt:
                subscription.expires_at,
                createdAt:
                subscription.createdAt,
                updatedAt:
                subscription.updatedAt,
            }
            : null,

        hasActiveSubscription:
            isSubscriptionActive(
                subscription
            ),

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

class AdminUsersService {
    async getAll(
        input: GetAdminUsersInput
    ): Promise<GetAdminUsersResult> {
        const page =
            normalizePositiveInteger(
                input.page,
                DEFAULT_PAGE
            );

        const requestedLimit =
            normalizePositiveInteger(
                input.limit,
                DEFAULT_LIMIT
            );

        const limit = Math.min(
            requestedLimit,
            MAX_LIMIT
        );

        const offset =
            (page - 1) * limit;

        const userWhere =
            buildUserWhere(input.search);

        const subscriptionWhere =
            buildSubscriptionFilterWhere(
                input.subscriptionStatus
            );

        const include =
            buildSubscriptionInclude(
                input.subscriptionStatus
            );

        const result =
            await User.findAndCountAll({
                where: {
                    [Op.and]: [
                        userWhere,
                        subscriptionWhere,
                    ],
                },

                include: [
                    include,
                ],

                order: buildOrder(
                    input.sortBy,
                    input.sortDirection
                ),

                limit,
                offset,
                distinct: true,
                subQuery: false,
            });

        const totalItems = result.count;

        const totalPages =
            totalItems === 0
                ? 0
                : Math.ceil(
                    totalItems / limit
                );

        return {
            users: result.rows.map(
                mapUserToListItem
            ),

            pagination: {
                page,
                limit,

                totalItems,
                totalPages,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1,
            },

            filters: {
                search:
                    input.search?.trim() ||
                    null,

                subscriptionStatus:
                input.subscriptionStatus,

                sortBy:
                input.sortBy,

                sortDirection:
                input.sortDirection,
            },
        };
    }
}

const adminUsersService =
    new AdminUsersService();

export default adminUsersService;