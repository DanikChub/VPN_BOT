import { Router } from "express";

import adminAuthRouter from "./auth/admin-auth.router";
import { authenticateAdmin } from "./middleware/authenticate-admin.middleware";
import adminUsersRouter from "./users/admin-users.router";
import adminNodesRouter from "./nodes/admin-nodes.router";
import adminPlansRouter from "./plans/admin-plans.router";
import adminMarketingSourseRouter from "./marketing-sources/marketing-source.router";

const adminRouter = Router();


adminRouter.use(
    "/auth",
    adminAuthRouter
);


adminRouter.use(authenticateAdmin);

adminRouter.use(
    "/users",
    adminUsersRouter
);

adminRouter.use(
    "/nodes",
    adminNodesRouter
);

adminRouter.use(
    "/plans",
    adminPlansRouter
);

adminRouter.use(
    "/marketing-sources",
    adminMarketingSourseRouter
);

export default adminRouter;