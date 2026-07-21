import {Router} from "express";
import subscriptionController from "./subscription.controller";


const subscriptionRouter = Router();

subscriptionRouter.get(
    "/user/:userId",
    subscriptionController.getByUserId
);

subscriptionRouter.get(
    "/user/:userId/details",
    subscriptionController
        .getDetailsByUserId
        .bind(subscriptionController)
);

export default subscriptionRouter;