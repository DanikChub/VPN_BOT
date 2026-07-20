import {
    Request,
    Response,
    NextFunction
} from "express";

import orderService from "./order.service";
import paymentService
    from "../payments/payment.service";


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


            const {
                payment,
                paymentUrl
            } =
                await paymentService.create(
                    order.id
                );


            res.status(201).json({
                orderId: order.id,
                paymentId: payment.id,
                paymentUrl
            });

        } catch (error) {
            next(error);
        }
    }
}


export default new OrderController();