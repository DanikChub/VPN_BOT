import crypto from "node:crypto";

import {
    Transaction
} from "sequelize";

import User from "../users/user.model";

import VpnCredential
    from "./vpn-credential.model";


class VpnCredentialService {

    async get(
        userId: number,
        transaction?: Transaction
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
        transaction?: Transaction
    ): Promise<VpnCredential> {

        const user =
            await User.findByPk(
                userId,
                {
                    transaction,
                }
            );


        if (!user) {
            throw new Error(
                "User not found"
            );
        }


        const [credential] =
            await VpnCredential.findOrCreate({
                where: {
                    user_id: user.id,
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
    }
}


export default new VpnCredentialService();