import {Router} from "express";

import vpnController from "./vpn.controller";

const vpnRouter = Router();

vpnRouter.post(
    "/access",
    vpnController.activate.bind(vpnController)
);

vpnRouter.post(
    "/deactivate",
    vpnController.deactivate.bind(
        vpnController
    )
);

export default vpnRouter;