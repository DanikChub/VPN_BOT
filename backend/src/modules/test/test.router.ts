import { Router } from "express";

import controller from "./test.controller";


const router = Router();


router.post(
    "/subscription/extend",
    controller.extend
);


export default router;