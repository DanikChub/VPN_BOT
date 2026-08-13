import {
    Router,
} from "express";

import {
    requirePermission,
} from "../middleware/require-permission.middleware";

import adminNodesController
    from "./admin-nodes.controller";


const adminNodesRouter =
    Router();


adminNodesRouter.get(
    "/",
    requirePermission(
        "nodes.read",
    ),
    adminNodesController.getAll.bind(
        adminNodesController,
    ),
);


adminNodesRouter.get(
    "/:id",
    requirePermission(
        "nodes.read",
    ),
    adminNodesController.getById.bind(
        adminNodesController,
    ),
);


adminNodesRouter.post(
    "/",
    requirePermission(
        "nodes.create",
    ),
    adminNodesController.create.bind(
        adminNodesController,
    ),
);


adminNodesRouter.post(
    "/:id/sync-users",
    requirePermission(
        "nodes.sync",
    ),
    adminNodesController.syncUsers.bind(
        adminNodesController,
    ),
);

adminNodesRouter.post(
    "/:id/install-agent",

    requirePermission(
        "nodes.create",
    ),

    adminNodesController
        .installAgent
        .bind(
            adminNodesController,
        ),
);

adminNodesRouter.patch(
    "/:id",
    requirePermission(
        "nodes.update",
    ),
    adminNodesController
        .updateField
        .bind(
            adminNodesController,
        ),
);

adminNodesRouter.get(
    "/:id/details",

    requirePermission(
        "nodes.read",
    ),

    adminNodesController
        .getDetails
        .bind(
            adminNodesController,
        ),
);

adminNodesRouter.delete(
    "/:id",

    requirePermission(
        "nodes.delete",
    ),

    adminNodesController
        .delete
        .bind(
            adminNodesController,
        ),
);


export default adminNodesRouter;