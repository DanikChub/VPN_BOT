import { Router } from "express";

import { requirePermission } from "../middleware/require-permission.middleware";
import adminUsersController from "./admin-users.controller";

const adminUsersRouter = Router();

adminUsersRouter.get(
    "/",
    requirePermission("users.read"),
    adminUsersController.getAll.bind(
        adminUsersController
    )
);

export default adminUsersRouter;