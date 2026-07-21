import {
    Transaction
} from "sequelize";

import Subscription
    from "./subscription.model";

import vpnCredentialService
    from "../vpn/vpn-credential.service";

import vpnAccessService
    from "../vpn/vpn-access.service";

interface SubscriptionDetails {
    id: number;
    user_id: number;
    status: string;
    expires_at: Date;
    subscription_url: string | null;
}

class SubscriptionService {

    async getByUserId(
        userId: number,
        transaction?: Transaction
    ): Promise<Subscription | null> {

        return Subscription.findOne({
            where: {
                user_id: userId,
            },
            transaction,
        });
    }

    async getDetailsByUserId(
        userId: number,
        transaction?: Transaction
    ): Promise<SubscriptionDetails | null> {
        const subscription =
            await this.getByUserId(
                userId,
                transaction
            );

        if (!subscription) {
            return null;
        }

        const expiresAt =
            new Date(subscription.expires_at);

        const isActive =
            subscription.status === "active" &&
            !Number.isNaN(expiresAt.getTime()) &&
            expiresAt.getTime() > Date.now();

        let subscriptionUrl: string | null =
            null;

        if (isActive) {
            const credential =
                await vpnCredentialService.get(
                    userId,
                    transaction
                );

            if (!credential) {
                throw new Error(
                    "VPN credential not found for active subscription"
                );
            }

            const publicBackendUrl =
                process.env.PUBLIC_API_URL;

            if (!publicBackendUrl) {
                throw new Error(
                    "PUBLIC_API_URL is not configured"
                );
            }

            subscriptionUrl = [
                publicBackendUrl.replace(/\/$/, ""),
                "sub",
                credential.subscription_token,
            ].join("/");
        }

        return {
            id: subscription.id,
            user_id: subscription.user_id,
            status: subscription.status,
            expires_at: subscription.expires_at,
            subscription_url: subscriptionUrl,
        };
    }


    async extend(
        userId: number,
        durationDays: number,
        transaction?: Transaction
    ): Promise<Subscription> {

        if (
            !Number.isInteger(durationDays) ||
            durationDays <= 0
        ) {
            throw new Error(
                "Invalid subscription duration"
            );
        }


        const credential =
            await vpnCredentialService.getOrCreate(
                userId,
                transaction
            );


        const [subscription] =
            await Subscription.findOrCreate({
                where: {
                    user_id: userId,
                },

                defaults: {
                    user_id:
                    userId,

                    status:
                        "active",

                    expires_at:
                        new Date(),
                },

                transaction,
            });


        if (transaction) {
            await subscription.reload({
                transaction,
                lock:
                transaction.LOCK.UPDATE,
            });
        }


        const now =
            new Date();


        const currentExpiresAt =
            new Date(
                subscription.expires_at
            );


        const baseDate =
            subscription.status === "active" &&
            currentExpiresAt > now
                ? currentExpiresAt
                : now;


        const expiresAt =
            new Date(baseDate);


        expiresAt.setUTCDate(
            expiresAt.getUTCDate() +
            durationDays
        );


        subscription.status =
            "active";

        subscription.expires_at =
            expiresAt;


        await subscription.save({
            transaction,
        });


        const grantAccess =
            async (): Promise<void> => {

                try {
                    await vpnAccessService.grant(
                        credential
                    );
                } catch (error) {
                    console.error(
                        `[VPN] Failed to grant access for user ${userId}:`,
                        error
                    );
                }
            };


        if (transaction) {
            transaction.afterCommit(
                grantAccess
            );
        } else {
            await grantAccess();
        }


        return subscription;
    }


    async expire(
        userId: number
    ): Promise<Subscription> {

        const credential =
            await vpnCredentialService.get(
                userId
            );


        if (!credential) {
            throw new Error(
                "VPN credential not found"
            );
        }


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


        subscription.status =
            "expired";


        await subscription.save();


        return subscription;
    }
}


export default new SubscriptionService();