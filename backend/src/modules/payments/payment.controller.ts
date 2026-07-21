import {
    NextFunction,
    Request,
    Response
} from "express";

import paymentService
    from "./payment.service";


class PaymentController {

    async create(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const orderId =
                Number(
                    req.body.orderId
                );

            const paymentMethodId =
                Number(
                    req.body.paymentMethodId
                );


            if (
                !Number.isInteger(orderId) ||
                orderId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Invalid orderId"
                });
            }


            if (
                !Number.isInteger(
                    paymentMethodId
                ) ||
                paymentMethodId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Invalid paymentMethodId"
                });
            }


            const result =
                await paymentService.create(
                    orderId,
                    paymentMethodId
                );


            return res
                .status(201)
                .json(result);

        } catch (error) {
            next(error);
        }
    }


    async check(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const paymentId =
                Number(
                    req.params.paymentId
                );


            if (
                !Number.isInteger(paymentId) ||
                paymentId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Invalid paymentId"
                });
            }


            const result =
                await paymentService.check(
                    paymentId
                );


            return res
                .status(200)
                .json(result);

        } catch (error) {
            next(error);
        }
    }
}


export default new PaymentController();