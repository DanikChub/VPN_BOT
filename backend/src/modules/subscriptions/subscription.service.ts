import Subscription from "./subscription.model";

import vpnService from "../vpn/vpn.service";
import vpnAccessService from "../vpn/vpn-access.service";

class SubscriptionService {
    async extend(
        userId: number,
        durationDays: number
    ): Promise<Subscription> {
        const credential =
            await vpnService.getOrCreateCredential(
                userId
            );

        const [subscription] =
            await Subscription.findOrCreate({
                where: {
                    user_id: userId,
                },
                defaults: {
                    user_id: userId,
                    status: "active",
                    expires_at: new Date(),
                },
            });

        const now = new Date();

        const baseDate =
            subscription.status === "active" &&
            subscription.expires_at > now
                ? subscription.expires_at
                : now;

        const expiresAt = new Date(baseDate);

        expiresAt.setDate(
            expiresAt.getDate() + durationDays
        );

        await vpnAccessService.grant(
            credential
        );

        subscription.status = "active";
        subscription.expires_at = expiresAt;

        await subscription.save();

        return subscription;
    }

    async expire(
        userId: number
    ): Promise<Subscription> {
        const credential =
            await vpnService.getOrCreateCredential(
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

        await vpnAccessService.revoke(
            credential
        );

        subscription.status = "expired";

        await subscription.save();

        return subscription;
    }
}

export default new SubscriptionService();