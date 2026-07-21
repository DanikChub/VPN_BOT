import {
    Request,
    Response,
    NextFunction
} from "express";

import orderService from "./order.service";



class OrderController {

    async create(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const {
                userId,
                planId
            } = req.body;




            const order =
                await orderService.create(
                    userId,
                    planId
                );

            res.status(201).json({
                id: order.id,
                plan_name: order.plan_name,
                duration_days: order.duration_days,
                amount: order.amount,
                currency: order.currency,
            });

        } catch (error) {
            next(error);
        }
    }
}


export default new OrderController();