import {
    Request,
    Response,
    NextFunction,
} from "express";

import paymentMethodService
    from "./payment-method.service";

class PaymentMethodController {
    async getActive(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const paymentMethods =
                await paymentMethodService.getActive();

            res.status(200).json(
                paymentMethods
            );
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentMethodController();