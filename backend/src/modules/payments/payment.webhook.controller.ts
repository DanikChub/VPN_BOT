import {
    NextFunction,
    Request,
    Response,
} from "express";

import paymentGatewayRegistry
    from "./payment-gateway.registry";

import paymentService
    from "./payment.service";


class PaymentWebhookController {

    async handle(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const code =
                req.params.code;

            if (
                typeof code !== "string" ||
                !code
            ) {
                return res.status(400).json({
                    message:
                        "Invalid gateway code",
                });
            }

            const gateway =
                paymentGatewayRegistry.get(
                    code
                );


            if (!gateway.parseWebhook) {
                return res.status(404).json({
                    message:
                        `Gateway "${code}" does not support webhooks`,
                });
            }


            const event =
                await gateway.parseWebhook({
                    headers:
                    req.headers,

                    body:
                    req.body,

                    // rawBody:
                    // req.rawBody,
                });


            /*
             * Это валидное, но неинтересующее
             * нас событие.
             */
            if (!event.handled) {
                return res.status(200).json({
                    ok:
                        true,
                });
            }


            if (!event.paymentId) {
                throw new Error(
                    "Webhook paymentId is missing"
                );
            }


            await paymentService.processWebhook({
                code,

                paymentId:
                event.paymentId,

                externalPaymentId:
                event.externalPaymentId,
            });


            return res.status(200).json({
                ok:
                    true,
            });

        } catch (error) {
            next(error);
        }
    }
}


export default new PaymentWebhookController();