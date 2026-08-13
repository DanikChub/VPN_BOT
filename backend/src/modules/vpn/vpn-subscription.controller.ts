import {
    Request,
    Response,
} from "express";

import Subscription
    from "../subscriptions/subscription.model";

import VpnCredential
    from "./vpn-credential.model";

import VpnNode
    from "../vpn-nodes/vpn-node.model";

import vlessUrlService
    from "./vless-url.service";
import {readFileSync} from "node:fs";
import path from "node:path";


const instructionPageTemplate =
    readFileSync(
        path.join(
            __dirname,
            "instruction-page.html",
        ),
        "utf8",
    );


class VpnSubscriptionController {

    async getConfig(
        req: Request,
        res: Response
    ): Promise<void> {

        const token =
            String(req.params.token);


        const credential =
            await VpnCredential.findOne({
                where: {
                    subscription_token:
                    token,
                },
            });


        if (!credential) {
            res
                .status(404)
                .send(
                    "Subscription not found"
                );

            return;
        }


        const subscription =
            await Subscription.findOne({
                where: {
                    user_id:
                    credential.user_id,
                },
            });


        if (
            !subscription ||
            subscription.status !== "active" ||
            subscription.expires_at.getTime() <=
            Date.now()
        ) {
            res
                .status(403)
                .send(
                    "Subscription expired"
                );

            return;
        }


        const nodes =
            await VpnNode.findAll({
                where: {
                    is_active: true,
                },
            });


        const configs =
            nodes.map(
                node =>
                    vlessUrlService.build(
                        credential,
                        node,
                    ),
            );


        const accept =
            req.headers.accept ?? "";

        const userAgent =
            req.headers["user-agent"] ?? "";

        const isHapp =
            userAgent
                .toLowerCase()
                .includes("happ");

        const wantsHtml =
            !isHapp &&
            accept.includes("text/html");


        if (wantsHtml) {
            const subscriptionUrl =
                `${req.protocol}://${req.get("host")}${req.originalUrl}`;

            res
                .status(200)
                .type("html")
                .send(
                    this.renderInstructionPage({
                        subscriptionUrl,
                    }),
                );

            return;
        }


        const expire =
            Math.floor(
                subscription.expires_at.getTime()
                / 1000,
            );


        res
            .status(200)
            .set({
                "Content-Type":
                    "application/json; charset=utf-8",

                "Cache-Control":
                    "no-store",

                "profile-title":
                    "IORDAN VPN",

                "profile-update-interval":
                    "1",

                "subscription-userinfo":
                    `upload=0; download=0; total=0; expire=${expire}`,

                "support-url":
                    "https://t.me/vpn_iordan_bot",
            })
            .json(
                configs,
            );
    }



    private renderInstructionPage(
        input: {
            subscriptionUrl: string;
        },
    ): string {
        return instructionPageTemplate
            .replaceAll(
                "{{SUBSCRIPTION_URL}}",
                this.escapeHtml(
                    input.subscriptionUrl,
                ),
            )
            .replaceAll(
                "{{SUBSCRIPTION_URL_JS}}",
                JSON.stringify(
                    input.subscriptionUrl,
                ).slice(1, -1));
    }

    private escapeHtml(
        value: string,
    ): string {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#039;");
    }

}


export default new VpnSubscriptionController();