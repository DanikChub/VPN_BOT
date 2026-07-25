import express from "express";
import cors from "cors";

import router from "./routes";

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
app.get(
    "/sub/:token",
    vpnSubscriptionController.getConfig.bind(
        vpnSubscriptionController
    )
);

export default app;