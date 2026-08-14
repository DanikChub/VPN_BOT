import {
    Request,
    Response,
} from "express";

import marketingSourceService
    from "./marketing-source.service";

import {
    marketingSourceTypes,
    MarketingSourceType,
} from "./marketing-source.types";


class MarketingSourceController {

    async getAll(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            let isActive:
                boolean | undefined;


            if (
                req.query.is_active ===
                "true"
            ) {
                isActive = true;
            }


            if (
                req.query.is_active ===
                "false"
            ) {
                isActive = false;
            }


            const type =
                req.query.type
                    ? String(req.query.type) as MarketingSourceType
                    : undefined;


            const search =
                req.query.search
                    ? String(req.query.search)
                    : undefined;


            const sources =
                await marketingSourceService.getAll({
                    is_active: isActive,
                    type,
                    search,
                });


            res.json(sources);

        } catch (error) {

            console.error(
                error
            );


            res.status(500).json({
                message:
                    "Failed to get marketing sources",
            });
        }
    }


    async getById(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id =
                Number(req.params.id);


            if (
                !Number.isInteger(id)
            ) {
                res.status(400).json({
                    message:
                        "Invalid source id",
                });

                return;
            }


            const source =
                await marketingSourceService
                    .getById(id);


            if (!source) {
                res.status(404).json({
                    message:
                        "Marketing source not found",
                });

                return;
            }


            res.json(source);

        } catch (error) {

            console.error(
                error
            );


            res.status(500).json({
                message:
                    "Failed to get marketing source",
            });
        }
    }


    async create(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const {
                name,
                code,
                type,
            } = req.body;


            if (
                !name ||
                !code ||
                !type
            ) {
                res.status(400).json({
                    message:
                        "name, code and type are required",
                });

                return;
            }


            if (
                !marketingSourceTypes
                    .includes(type)
            ) {
                res.status(400).json({
                    message:
                        "Invalid marketing source type",
                });

                return;
            }


            const source =
                await marketingSourceService
                    .create({
                        name,
                        code,
                        type,
                    });


            res
                .status(201)
                .json(source);

        } catch (error) {

            this.handleError(
                error,
                res
            );
        }
    }


    async update(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id =
                Number(req.params.id);


            if (
                !Number.isInteger(id)
            ) {
                res.status(400).json({
                    message:
                        "Invalid source id",
                });

                return;
            }


            const {
                name,
                code,
                type,
                is_active,
            } = req.body;


            if (
                type !== undefined &&
                !marketingSourceTypes
                    .includes(type)
            ) {
                res.status(400).json({
                    message:
                        "Invalid marketing source type",
                });

                return;
            }


            if (
                is_active !== undefined &&
                typeof is_active !==
                "boolean"
            ) {
                res.status(400).json({
                    message:
                        "is_active must be boolean",
                });

                return;
            }


            const source =
                await marketingSourceService
                    .update(
                        id,
                        {
                            name,
                            code,
                            type,
                            is_active,
                        }
                    );


            if (!source) {
                res.status(404).json({
                    message:
                        "Marketing source not found",
                });

                return;
            }


            res.json(source);

        } catch (error) {

            this.handleError(
                error,
                res
            );
        }
    }


    async archive(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id =
                Number(req.params.id);


            const source =
                await marketingSourceService
                    .archive(id);


            if (!source) {
                res.status(404).json({
                    message:
                        "Marketing source not found",
                });

                return;
            }


            res.json(source);

        } catch (error) {

            this.handleError(
                error,
                res
            );
        }
    }


    async restore(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id =
                Number(req.params.id);


            const source =
                await marketingSourceService
                    .restore(id);


            if (!source) {
                res.status(404).json({
                    message:
                        "Marketing source not found",
                });

                return;
            }


            res.json(source);

        } catch (error) {

            this.handleError(
                error,
                res
            );
        }
    }


    private handleError(
        error: unknown,
        res: Response
    ): void {

        console.error(
            error
        );


        if (
            error instanceof Error
        ) {

            switch (
                error.message
                ) {

                case "MARKETING_SOURCE_CODE_EXISTS":

                    res
                        .status(409)
                        .json({
                            message:
                                "Marketing source with this code already exists",
                        });

                    return;


                case "MARKETING_SOURCE_CODE_REQUIRED":

                    res
                        .status(400)
                        .json({
                            message:
                                "Marketing source code is required",
                        });

                    return;


                case "MARKETING_SOURCE_CODE_INVALID":

                    res
                        .status(400)
                        .json({
                            message:
                                "Code may contain only a-z, 0-9, _ and -",
                        });

                    return;


                case "MARKETING_SOURCE_CODE_TOO_LONG":

                    res
                        .status(400)
                        .json({
                            message:
                                "Marketing source code is too long",
                        });

                    return;
            }
        }


        res.status(500).json({
            message:
                "Marketing source operation failed",
        });
    }

    async getUsers(
        req:Request,
        res:Response
    ):Promise<void>{

        try {

            const id =
                Number(req.params.id);


            const result =
                await marketingSourceService
                    .getUsers(id);


            if(!result){

                res.status(404).json({
                    message:
                        "Marketing source not found",
                });

                return;
            }


            res.json(result);


        } catch(error){

            console.error(error);


            res.status(500).json({
                message:
                    "Failed to get source users",
            });
        }
    }
}


export default new MarketingSourceController();