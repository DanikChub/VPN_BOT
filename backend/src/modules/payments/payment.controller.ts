import {
    NextFunction,
    Request,
    Response
} from "express";

import paymentService
    from "./payment.service";


class PaymentController {

    async getStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const paymentId =
                Number(req.params.paymentId);

            const payment =
                await paymentService.getStatus(
                    paymentId
                );

            res.json({
                paymentId: payment.id,
                status: payment.status
            });

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
                Number(req.params.paymentId);


            const payment =
                await paymentService.checkAndConfirm(
                    paymentId
                );


            res.json({
                paymentId: payment.id,
                status: payment.status
            });

        } catch (error) {
            next(error);
        }
    }
}


export default new PaymentController();