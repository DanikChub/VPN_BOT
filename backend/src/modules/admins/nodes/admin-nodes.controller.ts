import {
    Request,
    Response,
} from "express";

import type {
    SyncUsersMode,
} from "@vpn/common";

import adminNodesService
    from "./admin-nodes.container";


class AdminNodesController {

    async getAll(
        _req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const nodes =
                await adminNodesService.getAll();

            res.json(nodes);
        } catch (error) {
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
                Number(req.params.id);

            if (
                !Number.isInteger(nodeId) ||
                nodeId <= 0
            ) {
                res.status(400).json({
                    error:
                        "Invalid node id",
                });

                return;
            }

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
        } catch (error) {
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

            res.status(201).json(node);
        } catch (error) {
            res.status(500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            });
        }
    }


    async syncUsers(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            const nodeId =
                Number(req.params.id);

            if (
                !Number.isInteger(nodeId) ||
                nodeId <= 0
            ) {
                res.status(400).json({
                    error:
                        "Invalid node id",
                });

                return;
            }

            const rawMode =
                req.body?.mode;

            const mode:
                SyncUsersMode =
                rawMode ?? "reconcile";

            if (
                mode !== "reconcile" &&
                mode !== "rebuild"
            ) {
                res.status(400).json({
                    error:
                        "Mode must be reconcile or rebuild",
                });

                return;
            }

            const result =
                await adminNodesService.syncUsers(
                    nodeId,
                    mode,
                );

            if (!result) {
                res.status(404).json({
                    error:
                        "Node not found",
                });

                return;
            }

            res.json(result);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                message ===
                "Node agent is offline" ||
                message.startsWith(
                    "Node is not ready:",
                )
            ) {
                res.status(409).json({
                    error:
                    message,
                });

                return;
            }

            res.status(500).json({
                error:
                message,
            });
        }
    }

    async installAgent(
        req: Request,
        res: Response,
    ): Promise<void> {

        try {

            const nodeId =
                Number(
                    req.params.id,
                );


            if (
                !Number.isInteger(nodeId) ||
                nodeId <= 0
            ) {
                res.status(400).json({
                    error:
                        "Invalid node id",
                });

                return;
            }


            const sshPassword =
                req.body?.sshPassword;


            if (
                typeof sshPassword !==
                "string" ||
                !sshPassword
            ) {
                res.status(400).json({
                    error:
                        "sshPassword is required",
                });

                return;
            }


            await adminNodesService
                .installAgent(
                    nodeId,
                    sshPassword,
                );


            res.json({
                nodeId,

                installed:
                    true,
            });

        } catch (error) {

            res.status(500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            });

        }
    }
}


export default new AdminNodesController();