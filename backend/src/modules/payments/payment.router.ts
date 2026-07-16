import {Router} from "express";

import paymentController from "./payment.controller";
import paymentWebhookController from "./payment.webhook.controller";


const paymentRouter = Router();


paymentRouter.post(
    "/fake-success",
    paymentController.fakeSuccess
);

paymentRouter.post(
    "/webhook/crypto",
    paymentWebhookController.crypto
);

export default paymentRouter;