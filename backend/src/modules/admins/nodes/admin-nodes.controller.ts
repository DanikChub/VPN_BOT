import {
    Request,
    Response,
} from "express";

import adminNodesService
    from "./admin-nodes.service";


class AdminNodesController {


    async getAll(
        _req: Request,
        res: Response,
    ): Promise<void> {

        try {

            const nodes =
                await adminNodesService.getAll();


            res.json(nodes);

        } catch(error) {

            res.status(500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            });

        }
    }



    async getById(
        req: Request,
        res: Response,
    ): Promise<void> {

        try {

            const nodeId =
                Number(
                    req.params.id,
                );


            const node =
                await adminNodesService.getById(
                    nodeId,
                );


            if (!node) {

                res.status(404).json({
                    error:
                        "Node not found",
                });

                return;
            }


            res.json(node);


        } catch(error) {

            res.status(500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            });

        }
    }

    async create(
        req: Request,
        res: Response,
    ): Promise<void> {

        try {

            const node =
                await adminNodesService.create(
                    req.body,
                );


            res.status(201)
                .json(node);


        } catch(error) {

            res.status(500)
                .json({
                    error:
                        error instanceof Error
                            ? error.message
                            : String(error),
                });

        }
    }

}


export default new AdminNodesController();