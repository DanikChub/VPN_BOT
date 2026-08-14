import {
    Router,
} from "express";

import marketingSourceController
    from "./marketing-source.controller";

import {
    requirePermission,
} from "../middleware/require-permission.middleware";


const adminMarketingSourseRouter =
    Router();


adminMarketingSourseRouter.get(
    "/",
    requirePermission(
        "marketing_sources.read"
    ),
    marketingSourceController
        .getAll
        .bind(
            marketingSourceController
        )
);


adminMarketingSourseRouter.get(
    "/:id",
    requirePermission(
        "marketing_sources.read"
    ),
    marketingSourceController
        .getById
        .bind(
            marketingSourceController
        )
);


adminMarketingSourseRouter.post(
    "/",
    requirePermission(
        "marketing_sources.create"
    ),
    marketingSourceController
        .create
        .bind(
            marketingSourceController
        )
);


adminMarketingSourseRouter.patch(
    "/:id",
    requirePermission(
        "marketing_sources.update"
    ),
    marketingSourceController
        .update
        .bind(
            marketingSourceController
        )
);


adminMarketingSourseRouter.delete(
    "/:id",
    requirePermission(
        "marketing_sources.delete"
    ),
    marketingSourceController
        .archive
        .bind(
            marketingSourceController
        )
);


adminMarketingSourseRouter.post(
    "/:id/restore",
    requirePermission(
        "marketing_sources.update"
    ),
    marketingSourceController
        .restore
        .bind(
            marketingSourceController
        )
);

adminMarketingSourseRouter.get(
    "/:id/users",
    requirePermission(
        "marketing_sources.read"
    ),
    marketingSourceController
        .getUsers
        .bind(
            marketingSourceController
        )
);


export default adminMarketingSourseRouter;