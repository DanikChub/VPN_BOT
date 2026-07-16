import { Request, Response } from "express";

import subscriptionService from "../subscriptions/subscription.service";


class TestController {

    async extend(
        req: Request,
        res: Response
    ) {
        const userId = Number(req.body.userId);

        const subscription =
            await subscriptionService.extend(
                userId,
                30
            );

        res.json(subscription);
    }
}


export default new TestController();