import {Router} from "express";

import paymentController from "./payment.controller";
import paymentWebhookController from "./payment.webhook.controller";


const paymentRouter = Router();


// paymentRouter.post(
//     "/fake-success",
//     paymentController.fakeSuccess
// );

paymentRouter.post(
    "/webhook/crypto",
    paymentWebhookController.crypto
);

paymentRouter.get(
    "/:paymentId/status",
    paymentController.getStatus.bind(
        paymentController
    )
);

paymentRouter.post(
    "/:paymentId/check",
    paymentController.check.bind(
        paymentController
    )
);

export default paymentRouter;