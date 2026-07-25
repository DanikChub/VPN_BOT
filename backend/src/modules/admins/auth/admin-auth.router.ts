import { Router } from "express";

import { authenticateAdmin } from "../middleware/authenticate-admin.middleware";

import adminAuthController from "./admin-auth.controller";

const adminAuthRouter = Router();

adminAuthRouter.post(
    "/login",
    adminAuthController.login.bind(
        adminAuthController
    )
);

adminAuthRouter.get(
    "/me",
    authenticateAdmin,
    adminAuthController.me.bind(
        adminAuthController
    )
);

export default adminAuthRouter;