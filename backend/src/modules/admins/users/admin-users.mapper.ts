import User
    from "../../users/user.model";

import Subscription
    from "../../subscriptions/subscription.model";

import type {
    AdminUserDetails,
    AdminUserListItem,
} from "./admin-users.types";


type UserWithSubscription =
    User & {
    subscription?:
        | Subscription
        | null;
};


export function mapAdminUserListItem(
    user: User
): AdminUserListItem {
    const populatedUser =
        user as UserWithSubscription;

    const subscription =
        populatedUser.subscription ??
        null;

    return {
        id:
        user.id,

        telegramId:
        user.telegramId,

        username:
        user.username,

        firstName:
        user.firstName,

        balanceAmount:
            Number(
                user.balance_amount
            ),

        subscription:
            subscription
                ? {
                    id:
                    subscription.id,

                    status:
                    subscription.status,

                    expiresAt:
                    subscription.expires_at,

                    createdAt:
                    subscription.createdAt,

                    updatedAt:
                    subscription.updatedAt,
                }
                : null,

        hasActiveSubscription:
            hasActiveSubscription(
                subscription
            ),

        createdAt:
        user.createdAt,

        updatedAt:
        user.updatedAt,
    };
}


function hasActiveSubscription(
    subscription:
        | Subscription
        | null
): boolean {
    return Boolean(
        subscription &&
        subscription.status === "active" &&
        subscription.expires_at
            .getTime() > Date.now()
    );
}



export function mapAdminUserDetails(
    user: User
): AdminUserDetails {
    const userWithSubscription =
        user as UserWithSubscription;

    const subscription =
        userWithSubscription.subscription ??
        null;

    return {
        id:
        user.id,

        telegramId:
        user.telegramId,

        username:
        user.username,

        firstName:
        user.firstName,

        balanceAmount:
            Number(
                user.balance_amount
            ),

        subscription:
            subscription
                ? {
                    id:
                    subscription.id,

                    status:
                    subscription.status,

                    expiresAt:
                    subscription.expires_at,

                    createdAt:
                    subscription.createdAt,

                    updatedAt:
                    subscription.updatedAt,

                    hasActiveSubscription:
                        subscription.status ===
                        "active" &&
                        subscription.expires_at
                            .getTime() >
                        Date.now(),
                }
                : null,

        createdAt:
        user.createdAt,

        updatedAt:
        user.updatedAt,
    };
}