import type {
    NextFunction,
    Request,
    Response,
} from "express";

import adminAuthService, {
    AdminAuthError,
} from "./admin-auth.service";

class AdminAuthController {
    async login(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const email =
                typeof req.body?.email === "string"
                    ? req.body.email
                    : "";

            const password =
                typeof req.body?.password === "string"
                    ? req.body.password
                    : "";

            const result =
                await adminAuthService.login({
                    email,
                    password,
                });

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof AdminAuthError) {
                res.status(error.statusCode).json({
                    message: error.message,
                });

                return;
            }

            next(error);
        }
    }

    async me(
        req: Request,
        res: Response
    ): Promise<void> {
        /*
         * Если контроллер вызван, middleware уже положил
         * администратора в req.admin.
         */
        if (!req.admin) {
            res.status(401).json({
                message:
                    "Administrator is not authenticated",
            });

            return;
        }

        res.status(200).json({
            admin: adminAuthService.toPublicData(
                req.admin
            ),
        });
    }
}

const adminAuthController =
    new AdminAuthController();

export default adminAuthController;