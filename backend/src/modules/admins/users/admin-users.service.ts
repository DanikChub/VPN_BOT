import {
    Op,
} from "sequelize";

import User
    from "../../users/user.model";

import Subscription
    from "../../subscriptions/subscription.model";

import subscriptionService
    from "../../subscriptions/subscription.service";

import {
    buildAdminUsersInclude,
    buildAdminUsersOrder,
    buildAdminUsersWhere,
} from "./admin-users.query";

import {
    mapAdminUserDetails,
    mapAdminUserListItem,
} from "./admin-users.mapper";

import vpnCredentialService
    from "../../vpn/vpn-credential.service";

import {
    vpnAccessService,
} from "../../../infrastructure/container";

import type {
    AdminUserDetails,
    GetAdminUsersInput,
    GetAdminUsersResult,
} from "./admin-users.types";


const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;


class AdminUsersService {
    async getAll(
        input: GetAdminUsersInput
    ): Promise<GetAdminUsersResult> {
        const page =
            this.normalizePositiveInteger(
                input.page,
                DEFAULT_PAGE
            );

        const limit =
            Math.min(
                this.normalizePositiveInteger(
                    input.limit,
                    DEFAULT_LIMIT
                ),
                MAX_LIMIT
            );

        const result =
            await User.findAndCountAll({
                where:
                    buildAdminUsersWhere(
                        input.search,
                        input.subscriptionStatus
                    ),

                include:
                    buildAdminUsersInclude(
                        input.subscriptionStatus
                    ),

                order:
                    buildAdminUsersOrder(
                        input.sortBy,
                        input.sortDirection
                    ),

                limit,

                offset:
                    (page - 1) *
                    limit,

                distinct:
                    true,

                subQuery:
                    false,
            });

        const totalItems =
            result.count;

        const totalPages =
            Math.ceil(
                totalItems / limit
            );

        return {
            users:
                result.rows.map(
                    mapAdminUserListItem
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
                    input.search ?? null,

                subscriptionStatus:
                input.subscriptionStatus,

                sortBy:
                input.sortBy,

                sortDirection:
                input.sortDirection,
            },
        };
    }

    async getById(
        userId: number
    ): Promise<AdminUserDetails> {
        const user =
            await User.findByPk(
                userId,
                {
                    include: [
                        {
                            model:
                            Subscription,

                            as:
                                "subscription",

                            required:
                                false,
                        },
                    ],
                }
            );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        return mapAdminUserDetails(
            user
        );
    }


    async extendSubscription(
        userId: number,
        durationDays: number
    ): Promise<Subscription> {
        await this.ensureUserExists(
            userId
        );

        return subscriptionService.extend(
            userId,
            durationDays
        );
    }


    async expireSubscription(
        userId: number
    ): Promise<Subscription> {
        await this.ensureUserExists(
            userId
        );

        return subscriptionService.expire(
            userId
        );
    }

    async blockSubscription(
        userId: number
    ): Promise<Subscription> {
        await this.ensureUserExists(
            userId
        );

        const subscription =
            await Subscription.findOne({
                where: {
                    user_id: userId,
                },
            });

        if (!subscription) {
            throw new Error(
                "Subscription not found"
            );
        }

        if (
            subscription.status ===
            "blocked"
        ) {
            return subscription;
        }

        const credential =
            await vpnCredentialService.get(
                userId
            );

        subscription.status =
            "blocked";

        await subscription.save();

        if (credential) {
            void vpnAccessService
                .revoke(
                    credential
                )
                .catch((error) => {
                    console.error(
                        "[VPN] Failed to revoke access after admin block",
                        {
                            userId,

                            credentialId:
                            credential.id,

                            uuid:
                            credential.uuid,

                            error:
                                error instanceof Error
                                    ? {
                                        name:
                                        error.name,

                                        message:
                                        error.message,

                                        stack:
                                        error.stack,
                                    }
                                    : error,
                        }
                    );
                });
        }

        return subscription;
    }

    async unblockSubscription(
        userId: number
    ): Promise<Subscription> {
        await this.ensureUserExists(
            userId
        );

        const subscription =
            await Subscription.findOne({
                where: {
                    user_id: userId,
                },
            });

        if (!subscription) {
            throw new Error(
                "Subscription not found"
            );
        }

        /*
         * Повторный запрос на разблокировку
         * также делаем идемпотентным.
         */
        if (
            subscription.status !==
            "blocked"
        ) {
            return subscription;
        }

        const expiresAt =
            new Date(
                subscription.expires_at
            );

        const isExpired =
            Number.isNaN(
                expiresAt.getTime()
            ) ||
            expiresAt.getTime() <=
            Date.now();

        if (isExpired) {
            subscription.status =
                "expired";

            await subscription.save();

            return subscription;
        }

        const credential =
            await vpnCredentialService
                .getOrCreate(
                    userId
                );

        subscription.status =
            "active";

        await subscription.save();

        /*
         * Повторяем подход SubscriptionService.extend:
         * состояние в БД уже сохранено,
         * ошибка конкретного узла не ломает запрос.
         */
        void vpnAccessService
            .grant(
                credential
            )
            .catch((error) => {
                console.error(
                    "[VPN] Failed to grant access after admin unblock",
                    {
                        userId,

                        credentialId:
                        credential.id,

                        uuid:
                        credential.uuid,

                        error:
                            error instanceof Error
                                ? {
                                    name:
                                    error.name,

                                    message:
                                    error.message,

                                    stack:
                                    error.stack,
                                }
                                : error,
                    }
                );
            });

        return subscription;
    }


    private normalizePositiveInteger(
        value: number,
        fallback: number
    ): number {
        return (
            Number.isInteger(value) &&
            value > 0
        )
            ? value
            : fallback;
    }


    private async ensureUserExists(
        userId: number
    ): Promise<void> {
        const user =
            await User.findByPk(
                userId,
                {
                    attributes: [
                        "id",
                    ],
                }
            );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }
    }
}


export default new AdminUsersService();