import {NextFunction, Request, Response} from "express";

import paymentService from "./payment.service";


class PaymentController {


    async fakeSuccess(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const paymentId =
                Number(req.body.paymentId);


            await paymentService.markSuccessful(
                paymentId
            );


            res.json({
                success: true
            });

        } catch(error) {
            next(error);
        }
    }

}


export default new PaymentController();