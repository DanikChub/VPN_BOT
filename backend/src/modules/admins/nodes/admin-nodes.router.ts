import { Router } from "express";

import { requirePermission } from "../middleware/require-permission.middleware";
import adminNodesController from "./admin-nodes.controller";


const adminNodesRouter =
    Router();


adminNodesRouter.get(
    "/",
    requirePermission("nodes.read"),
    adminNodesController.getAll.bind(
        adminNodesController,
    ),
);


adminNodesRouter.get(
    "/:id",
    requirePermission("nodes.read"),
    adminNodesController.getById.bind(
        adminNodesController,
    ),
);

adminNodesRouter.post(
    "/",
    requirePermission("nodes.create"),
    adminNodesController.create.bind(
        adminNodesController
    )
);


export default adminNodesRouter;