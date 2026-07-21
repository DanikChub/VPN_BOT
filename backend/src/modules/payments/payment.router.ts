import {
    Router
} from "express";

import paymentController
    from "./payment.controller";


const paymentRouter =
    Router();


paymentRouter.post(
    "/create",
    paymentController.create.bind(
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