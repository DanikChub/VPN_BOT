import type {
    NextFunction,
    Request,
    Response,
} from "express";

import adminPlansService
    from "./admin-plans.service";

import {
    parseAdminPlanId,
    parseCreateAdminPlanInput,
    parseUpdateAdminPlanInput,
} from "./admin-plans.validation";


class AdminPlansController {
    async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log(
                "=== NEW ADMIN PLANS CONTROLLER HIT ==="
            );

            const plans =
                await adminPlansService.getAll();
            console.log(plans)
            res.status(200).json({
                plans,
            });
        } catch (error) {
            next(error);
        }
    }


    async getById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const planId =
                parseAdminPlanId(
                    req.params.id
                );

            const plan =
                await adminPlansService
                    .getById(
                        planId
                    );

            res.status(200).json({
                plan,
            });
        } catch (error) {
            next(error);
        }
    }


    async create(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const input =
                parseCreateAdminPlanInput(
                    req.body
                );

            const plan =
                await adminPlansService
                    .create(
                        input
                    );

            res.status(201).json({
                plan,
            });
        } catch (error) {
            next(error);
        }
    }


    async update(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const planId =
                parseAdminPlanId(
                    req.params.id
                );

            const input =
                parseUpdateAdminPlanInput(
                    req.body
                );

            const plan =
                await adminPlansService
                    .update(
                        planId,
                        input
                    );

            res.status(200).json({
                plan,
            });
        } catch (error) {
            next(error);
        }
    }


    async delete(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const planId =
                parseAdminPlanId(
                    req.params.id
                );

            await adminPlansService
                .delete(
                    planId
                );

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}


export default new AdminPlansController();