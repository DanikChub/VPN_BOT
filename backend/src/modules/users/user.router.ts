import { Router } from "express";


import userController from "./user.controller";


const userRouter = Router();

userRouter.post(
    "/telegram",
    userController.registerTelegramUser.bind(
        userController
    )
);

export default userRouter;