import { Router } from "express";

import balanceController from "./balance.controller";

const balanceRouter = Router();

balanceRouter.get(
    "/telegram/:telegramId",
    balanceController.getByTelegramId.bind(
        balanceController
    )
);

export default balanceRouter;