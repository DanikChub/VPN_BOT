import { Op } from "sequelize";

import Subscription from "../modules/subscriptions/subscription.model";
import VpnCredential from "../modules/vpn/vpn-credential.model";
import vpnAccessService from "../modules/vpn/vpn-access.service";

class SubscriptionExpirationJob {
    private isRunning = false;

    async run(): Promise<void> {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

        try {
            const subscriptions = await Subscription.findAll({
                where: {
                    status: "active",
                    expires_at: {
                        [Op.lte]: new Date(),
                    },
                },
            });

            for (const subscription of subscriptions) {
                try {
                    const credential = await VpnCredential.findOne({
                        where: {
                            user_id: subscription.user_id,
                        },
                    });

                    if (!credential) {
                        console.error(
                            `[SUBSCRIPTIONS] Credential not found for user ${subscription.user_id}`
                        );

                        continue;
                    }

                    await vpnAccessService.revoke(credential);

                    subscription.status = "expired";

                    await subscription.save();

                    console.log(
                        `[SUBSCRIPTIONS] User ${subscription.user_id} expired`
                    );
                } catch (error) {
                    console.error(
                        `[SUBSCRIPTIONS] Failed to expire user ${subscription.user_id}:`,
                        error instanceof Error
                            ? error.message
                            : error
                    );
                }
            }
        } finally {
            this.isRunning = false;
        }
    }
}

export default new SubscriptionExpirationJob();