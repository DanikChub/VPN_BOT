import { Router } from "express";


import vpnRouter from "../modules/vpn/vpn.router";
import userRouter from "../modules/users/user.router";
import paymentRouter from "../modules/payments/payment.router";
import orderRouter from "../modules/orders/order.router";
import balanceRouter from "../modules/balances/balance.router";



const router = Router();

router.use("/users", userRouter);
router.use("/vpn", vpnRouter);
router.use("/payments", paymentRouter);
router.use("/orders", orderRouter);
router.use("/balances", balanceRouter);

export default router;

