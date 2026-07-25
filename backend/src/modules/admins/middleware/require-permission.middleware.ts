import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    adminHasEveryPermission,
    type AdminPermission,
} from "../admin-permissions";

export function requirePermission(
    ...requiredPermissions: AdminPermission[]
) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        const admin = req.admin;

        if (!admin) {
            res.status(401).json({
                message:
                    "Administrator is not authenticated",
            });

            return;
        }

        const hasAccess =
            adminHasEveryPermission(
                admin.role,
                requiredPermissions
            );

        if (!hasAccess) {
            res.status(403).json({
                message:
                    "You do not have permission to perform this action",
                requiredPermissions,
            });

            return;
        }

        next();
    };
}