import {
    Router,
} from "express";

import {
    requirePermission,
} from "../middleware/require-permission.middleware";

import adminPlansController
    from "./admin-plans.controller";


const adminPlansRouter =
    Router();


adminPlansRouter.get(
    "/",
    requirePermission(
        "plans.read"
    ),
    adminPlansController
        .getAll
        .bind(
            adminPlansController
        )
);


adminPlansRouter.get(
    "/:id",
    requirePermission(
        "plans.read"
    ),
    adminPlansController
        .getById
        .bind(
            adminPlansController
        )
);


adminPlansRouter.post(
    "/",
    requirePermission(
        "plans.create"
    ),
    adminPlansController
        .create
        .bind(
            adminPlansController
        )
);


adminPlansRouter.patch(
    "/:id",
    requirePermission(
        "plans.update"
    ),
    adminPlansController
        .update
        .bind(
            adminPlansController
        )
);


adminPlansRouter.delete(
    "/:id",
    requirePermission(
        "plans.delete"
    ),
    adminPlansController
        .delete
        .bind(
            adminPlansController
        )
);


export default adminPlansRouter;