import { Router } from "express";


import vpnRouter from "../modules/vpn/vpn.router";
import userRouter from "../modules/users/user.router";
import paymentRouter from "../modules/payments/payment.router";
import orderRouter from "../modules/orders/order.router";
import balanceRouter from "../modules/balances/balance.router";
import subscriptionRouter from "../modules/subscriptions/subscription.router";
import planRouter from "../modules/plans/plan.router";
import paymentMethodsRouter from "../modules/payments/payment-method.router";



const router = Router();

router.use("/users", userRouter);
router.use("/vpn", vpnRouter);
router.use("/payments", paymentRouter);
router.use("/orders", orderRouter);
router.use("/balances", balanceRouter);
router.use("/subscription", subscriptionRouter);
router.use("/plans", planRouter);
router.use("/payment-methods", paymentMethodsRouter);

export default router;

