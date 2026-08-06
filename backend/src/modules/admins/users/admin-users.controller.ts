import type {
    NextFunction,
    Request,
    Response,
} from "express";

import adminUsersService
    from "./admin-users.service";

import {
    parseAdminUserId,
    parseAdminUsersQuery,
    parseDurationDays,
} from "./admin-users.validation";


class AdminUsersController {
    async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const input =
                parseAdminUsersQuery(
                    req.query
                );

            const result =
                await adminUsersService
                    .getAll(input);

            res.status(200).json(
                result
            );
        } catch (error) {
            next(error);
        }
    }


    async extendSubscription(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const subscription =
                await adminUsersService
                    .extendSubscription(
                        parseAdminUserId(
                            req.params.id
                        ),

                        parseDurationDays(
                            req.body?.durationDays
                        )
                    );

            res.status(200).json({
                subscription,
            });
        } catch (error) {
            next(error);
        }
    }


    async expireSubscription(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const subscription =
                await adminUsersService
                    .expireSubscription(
                        parseAdminUserId(
                            req.params.id
                        )
                    );

            res.status(200).json({
                subscription,
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
            const userId =
                parseAdminUserId(
                    req.params.id
                );

            const user =
                await adminUsersService
                    .getById(
                        userId
                    );

            res.status(200).json({
                user,
            });
        } catch (error) {
            next(error);
        }
    }


    async blockSubscription(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId =
                parseAdminUserId(
                    req.params.id
                );

            const subscription =
                await adminUsersService
                    .blockSubscription(
                        userId
                    );

            res.status(200).json({
                subscription: {
                    id:
                    subscription.id,

                    userId:
                    subscription.user_id,

                    status:
                    subscription.status,

                    expiresAt:
                    subscription.expires_at,

                    createdAt:
                    subscription.createdAt,

                    updatedAt:
                    subscription.updatedAt,
                },
            });
        } catch (error) {
            next(error);
        }
    }


    async unblockSubscription(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId =
                parseAdminUserId(
                    req.params.id
                );

            const subscription =
                await adminUsersService
                    .unblockSubscription(
                        userId
                    );

            res.status(200).json({
                subscription: {
                    id:
                    subscription.id,

                    userId:
                    subscription.user_id,

                    status:
                    subscription.status,

                    expiresAt:
                    subscription.expires_at,

                    createdAt:
                    subscription.createdAt,

                    updatedAt:
                    subscription.updatedAt,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}


export default new AdminUsersController();