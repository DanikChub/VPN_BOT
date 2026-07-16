import {Router} from "express";

import orderController from "./order.controller";


const orderRouter = Router();


orderRouter.post(
    "/create",
    orderController.create
);


export default orderRouter;