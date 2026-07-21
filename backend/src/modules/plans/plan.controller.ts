import {
    Request,
    Response,
} from "express";

import planService from "./plan.service";

class PlanController {
    async getActivePlans(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const plans =
                await planService.getActivePlans();

            res.status(200).json(plans);
        } catch (error) {
            console.error(
                "Get active plans error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to get active plans",
            });
        }
    }
}

export default new PlanController();