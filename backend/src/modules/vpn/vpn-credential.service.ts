import crypto from "node:crypto";

import {
    DatabaseError,
    Transaction,
} from "sequelize";

import User from "../users/user.model";
import VpnCredential from "./vpn-credential.model";
import Subscription from "../subscriptions/subscription.model";

class VpnCredentialService {
    async get(
        userId: number,
        transaction?: Transaction,
    ): Promise<VpnCredential | null> {
        return VpnCredential.findOne({
            where: {
                user_id: userId,
            },
            transaction,
        });
    }

    async getOrCreate(
        userId: number,
        transaction?: Transaction,
    ): Promise<VpnCredential> {
        const user =
            await User.findByPk(
                userId,
                {
                    transaction,
                },
            );

        if (!user) {
            throw new Error(
                "User not found",
            );
        }

        try {
            const [credential] =
                await VpnCredential.findOrCreate({
                    where: {
                        user_id:
                        user.id,
                    },

                    defaults: {
                        user_id:
                        user.id,

                        uuid:
                            crypto.randomUUID(),

                        subscription_token:
                            crypto
                                .randomBytes(32)
                                .toString("hex"),
                    },

                    transaction,
                });

            return credential;
        } catch (error) {
            console.error(
                "[VPN CREDENTIAL] Failed:",
                error,
            );

            if (
                error instanceof
                DatabaseError
            ) {
                console.error(
                    "[VPN CREDENTIAL] PostgreSQL message:",
                    error.parent.message,
                );



                console.error(
                    "[VPN CREDENTIAL] SQL:",
                    error.sql,
                );

                console.error(
                    "[VPN CREDENTIAL] Parameters:",
                    error.parameters,
                );
            }

            throw error;
        }
    }

    public async findAllActive():
        Promise<VpnCredential[]> {

        return VpnCredential.findAll({
            include: [
                {
                    model:
                    User,

                    as:
                        "user",

                    required:
                        true,

                    include: [
                        {
                            model:
                            Subscription,

                            as:
                                "subscription",

                            required:
                                true,

                            where: {
                                status:
                                    "active",
                            },
                        },
                    ],
                },
            ],
        });
    }
}

export default new VpnCredentialService();