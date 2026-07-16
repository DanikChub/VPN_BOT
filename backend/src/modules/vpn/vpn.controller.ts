import {
    NextFunction,
    Request,
    Response,
} from "express";

import vpnService from "./vpn.service";

class VpnController {
    async activate(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = Number(req.body.user_id);

            const result =
                await vpnService.activateForUser(userId);

            res.json({
                subscription_url:
                    `${process.env.PUBLIC_API_URL}/sub/${result.credential.subscription_token}`,

                expires_at:
                result.subscription.expires_at,
            });
        } catch (error) {
            next(error);
        }
    }

    async deactivate(
        req: Request,
        res: Response
    ): Promise<void> {
        const userId = Number(req.body.userId);

        if (!Number.isInteger(userId)) {
            res.status(400).json({
                message: "Invalid userId",
            });

            return;
        }

        await vpnService.deactivateForUser(
            userId
        );

        res.json({
            success: true,
        });
    }
}

export default new VpnController();