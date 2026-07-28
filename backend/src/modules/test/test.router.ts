import { Router } from "express";

import controller from "./test.controller";
import type { CommandService } from "../../infrastructure/node-control/services/command.service";
import { AgentCommandType } from "@vpn/common";



export default function createTestRouter(
    commandService: CommandService,
) {
    const router = Router();


    router.post(
        "/subscription/extend",
        controller.extend
    );


    router.get(
        "/node/:id/status",
        async (req, res) => {

            console.log(
                "STATUS ENDPOINT CALLED",
                req.params.id,
            );


            try {

                const result =
                    await commandService.sendCommand(
                        Number(req.params.id),
                        AgentCommandType.GET_STATUS,
                        {},
                    );


                res.json(result);


            } catch(error) {

                console.error(error);

                res.status(500).json({
                    error:
                        error instanceof Error
                            ? error.message
                            : String(error),
                });
            }
        },
    );



    return router;
}