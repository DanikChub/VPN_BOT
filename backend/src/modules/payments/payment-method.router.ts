import { Router } from "express";

import paymentMethodController
    from "./payment-method.controller";

const paymentMethodsRouter = Router();

paymentMethodsRouter.get(
    "/active",
    paymentMethodController.getActive
);

export default paymentMethodsRouter;