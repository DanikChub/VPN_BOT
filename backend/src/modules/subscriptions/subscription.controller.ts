import {
    Request,
    Response,
} from "express";

import subscriptionService
    from "./subscription.service";

class SubscriptionController {
    async getByUserId(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const userId =
                Number(
                    req.params.userId
                );

            if (
                !Number.isInteger(userId) ||
                userId <= 0
            ) {
                res.status(400).json({
                    message:
                        "Invalid user id",
                });

                return;
            }

            const subscription =
                await subscriptionService
                    .getByUserId(
                        userId
                    );

            if (!subscription) {
                res.status(404).json({
                    message:
                        "Subscription not found",
                });

                return;
            }

            res.json(subscription);
        } catch (error) {
            console.error(
                "GET SUBSCRIPTION ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Internal server error",
            });
        }
    }


    async getDetailsByUserId(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const userId =
                Number(
                    req.params.userId
                );

            if (
                !Number.isInteger(userId) ||
                userId <= 0
            ) {
                res.status(400).json({
                    message:
                        "Invalid user id",
                });

                return;
            }

            const subscription =
                await subscriptionService
                    .getDetailsByUserId(
                        userId
                    );

            if (!subscription) {
                res.status(404).json({
                    message:
                        "Subscription not found",
                });

                return;
            }

            res.json(subscription);
        } catch (error) {
            console.error(
                "GET SUBSCRIPTION DETAILS ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Internal server error",
            });
        }
    }
}

export default new SubscriptionController();