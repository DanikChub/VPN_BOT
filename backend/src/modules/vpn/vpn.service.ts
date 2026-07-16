import crypto from "node:crypto";

import User from "../users/user.model";
import VpnCredential from "./vpn-credential.model";


import subscriptionService from "../subscriptions/subscription.service";

class VpnService {

    async getCredential(
        userId: number
    ): Promise<VpnCredential | null> {
        return VpnCredential.findOne({
            where: {
                user_id: userId,
            },
        });
    }

    async getOrCreateCredential(
        userId: number
    ): Promise<VpnCredential> {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const [credential] =
            await VpnCredential.findOrCreate({
                where: {
                    user_id: user.id,
                },
                defaults: {
                    user_id: user.id,
                    uuid: crypto.randomUUID(),
                    subscription_token:
                        crypto.randomBytes(32).toString("hex"),
                },
            });

        return credential;
    }

    async activateForUser(userId:number) {

        const credential =
            await this.getOrCreateCredential(userId);

        const subscription =
            await subscriptionService.extend(
                userId,
                30
            );

        return {
            credential,
            subscription
        };
    }

    async deactivateForUser(
        userId:number
    ) {
        return subscriptionService.expire(userId);
    }
}

export default new VpnService();

