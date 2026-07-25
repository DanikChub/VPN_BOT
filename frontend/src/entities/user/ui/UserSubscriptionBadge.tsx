import type {
    UserListItem,
} from "@/entities/user";
import {Badge} from "@/shared/ui";

interface UserSubscriptionBadgeProps {
    user: UserListItem;
}

export function UserSubscriptionBadge({
                                          user,
                                      }: UserSubscriptionBadgeProps) {
    if (!user.subscription) {
        return (
            <Badge variant="default">
                Нет подписки
            </Badge>
        );
    }

    if (
        user.subscription.status === "blocked"
    ) {
        return (
            <Badge variant="danger">
                Заблокирована
            </Badge>
        );
    }

    if (user.hasActiveSubscription) {
        return (
            <Badge variant="success">
                Активна
            </Badge>
        );
    }

    return (
        <Badge variant="warning">
            Истекла
        </Badge>
    );
}