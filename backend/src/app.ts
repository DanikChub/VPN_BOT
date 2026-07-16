import express from "express";
import cors from "cors";

import router from "./routes";
import testRouter from "./modules/test/test.router";

const app = express();
import vpnSubscriptionController from "./modules/vpn/vpn-subscription.controller";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
    });
});

app.use("/api", router);
app.use(
    "/api/test",
    testRouter
);
app.get(
    "/sub/:token",
    vpnSubscriptionController.getConfig.bind(
        vpnSubscriptionController
    )
);

export default app;