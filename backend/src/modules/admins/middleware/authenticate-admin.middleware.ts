import type {
    NextFunction,
    Request,
    Response,
} from "express";

import Admin from "../admin.model";

import adminAuthService, {
    AdminAuthError,
} from "../auth/admin-auth.service";

function getBearerToken(
    authorizationHeader: string | undefined
): string | null {
    if (!authorizationHeader) {
        return null;
    }

    const [scheme, token] =
        authorizationHeader.split(" ");

    if (
        scheme?.toLowerCase() !== "bearer" ||
        !token
    ) {
        return null;
    }

    return token;
}

export async function authenticateAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const token = getBearerToken(
            req.headers.authorization
        );

        if (!token) {
            res.status(401).json({
                message:
                    "Administrator access token is required",
            });

            return;
        }

        const payload =
            adminAuthService.verifyAccessToken(token);

        /*
         * Администратора обязательно перечитываем из БД.
         *
         * Поэтому блокировка аккаунта начинает работать
         * сразу, даже если JWT ещё не истёк.
         */
        const admin = await Admin.findByPk(
            payload.adminId
        );

        if (!admin) {
            res.status(401).json({
                message:
                    "Administrator account does not exist",
            });

            return;
        }

        if (admin.status !== "active") {
            res.status(403).json({
                message:
                    "Administrator account is blocked",
            });

            return;
        }

        req.admin = admin;

        next();
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