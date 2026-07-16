import {
    Request,
    Response,
} from "express";

import Subscription from "../subscriptions/subscription.model";
import VpnCredential from "./vpn-credential.model";
import VpnNode from "../vpn-nodes/vpn-node.model";
import vlessUrlService from "./vless-url.service";

class VpnSubscriptionController {
    async getConfig(
        req: Request,
        res: Response
    ): Promise<void> {
        const { token } = req.params;

        const credential =
            await VpnCredential.findOne({
                where: {
                    subscription_token: token,
                },
            });

        if (!credential) {
            res.status(404).send(
                "Subscription not found"
            );

            return;
        }

        const subscription =
            await Subscription.findOne({
                where: {
                    user_id: credential.user_id,
                },
            });

        if (
            !subscription ||
            subscription.status !== "active" ||
            subscription.expires_at.getTime() <
            Date.now()
        ) {
            res.status(403).send(
                "Subscription expired"
            );

            return;
        }

        const nodes = await VpnNode.findAll({
            where: {
                is_active: true,
            },
        });

        const links = nodes.map((node) =>
            vlessUrlService.build(
                credential,
                node
            )
        );

        res
            .type("text/plain")
            .send(links.join("\n"));
    }
}

export default new VpnSubscriptionController();