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

adminUsersRouter.get(
    "/:id",
    requirePermission("users.read"),
    adminUsersController.getById.bind(
        adminUsersController
    )
);

adminUsersRouter.post(
    "/:id/subscription/extend",
    requirePermission(
        "subscriptions.update"
    ),
    adminUsersController
        .extendSubscription
        .bind(
            adminUsersController
        )
);


adminUsersRouter.post(
    "/:id/subscription/expire",
    requirePermission(
        "subscriptions.update"
    ),
    adminUsersController
        .expireSubscription
        .bind(
            adminUsersController
        )
);

adminUsersRouter.post(
    "/:id/subscription/block",
    requirePermission(
        "subscriptions.update"
    ),
    adminUsersController
        .blockSubscription
        .bind(
            adminUsersController
        )
);

adminUsersRouter.post(
    "/:id/subscription/unblock",
    requirePermission(
        "subscriptions.update"
    ),
    adminUsersController
        .unblockSubscription
        .bind(
            adminUsersController
        )
);

export default adminUsersRouter;