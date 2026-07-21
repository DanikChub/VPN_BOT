import {
    Router,
} from "express";

import planController from "./plan.controller";

const planRouter = Router();

planRouter.get(
    "/active",
    planController.getActivePlans
);

export default planRouter;