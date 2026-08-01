import {
    Router
} from "express";

import paymentController
    from "./payment.controller";
import paymentWebhookController from "./payment.webhook.controller";


const paymentRouter =
    Router();


paymentRouter.post(
    "/create",
    paymentController.create.bind(
        paymentController
    )
);

paymentRouter.post(
    "/webhooks/:code",
    paymentWebhookController.handle
);


paymentRouter.post(
    "/:paymentId/check",
    paymentController.check.bind(
        paymentController
    )
);




export default paymentRouter;