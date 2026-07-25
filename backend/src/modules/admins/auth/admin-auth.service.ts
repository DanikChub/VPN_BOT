import bcrypt from "bcryptjs";
import jwt, {
    type JwtPayload,
    type SignOptions,
} from "jsonwebtoken";

import Admin from "../admin.model";

import type {
    AdminAccessTokenPayload,
    AdminLoginInput,
    AdminLoginResult,
    AdminPublicData,
} from "./admin-auth.types";

export class AdminAuthError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);

        this.name = "AdminAuthError";
    }
}

function getAdminJwtSecret(): string {
    const secret = process.env.ADMIN_JWT_SECRET;

    if (!secret) {
        throw new Error(
            "ADMIN_JWT_SECRET is not configured"
        );
    }

    return secret;
}

function getAdminJwtExpiresIn(): SignOptions["expiresIn"] {
    return (
        process.env.ADMIN_JWT_EXPIRES_IN ?? "8h"
    ) as SignOptions["expiresIn"];
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function toPublicAdminData(
    admin: Admin
): AdminPublicData {
    return {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        lastLoginAt: admin.last_login_at,
        createdAt: admin.created_at,
    };
}

class AdminAuthService {
    async login(
        input: AdminLoginInput
    ): Promise<AdminLoginResult> {
        const email = normalizeEmail(input.email);
        const password = input.password;

        if (!email || !password) {
            throw new AdminAuthError(
                "Email and password are required",
                400
            );
        }

        const admin = await Admin
            .scope("withPasswordHash")
            .findOne({
                where: {
                    email,
                },
            });


        if (!admin) {
            throw new AdminAuthError(
                "Invalid email or password",
                401
            );
        }

        const passwordMatches = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!passwordMatches) {
            throw new AdminAuthError(
                "Invalid email or password",
                401
            );
        }

        if (admin.status !== "active") {
            throw new AdminAuthError(
                "Administrator account is blocked",
                403
            );
        }

        const accessToken =
            this.generateAccessToken(admin.id);

        /*
         * Обновляем после успешной проверки пароля.
         */
        admin.last_login_at = new Date();

        await admin.save({
            fields: ["last_login_at"],
        });

        return {
            accessToken,
            admin: toPublicAdminData(admin),
        };
    }

    generateAccessToken(
        adminId: number
    ): string {
        const payload: AdminAccessTokenPayload = {
            adminId,
            tokenType: "admin_access",
        };

        return jwt.sign(
            payload,
            getAdminJwtSecret(),
            {
                expiresIn: getAdminJwtExpiresIn(),
            }
        );
    }

    verifyAccessToken(
        token: string
    ): AdminAccessTokenPayload {
        let decoded: string | JwtPayload;

        try {
            decoded = jwt.verify(
                token,
                getAdminJwtSecret()
            );
        } catch {
            throw new AdminAuthError(
                "Invalid or expired access token",
                401
            );
        }

        if (
            typeof decoded === "string" ||
            typeof decoded.adminId !== "number" ||
            decoded.tokenType !== "admin_access"
        ) {
            throw new AdminAuthError(
                "Invalid access token payload",
                401
            );
        }

        return {
            adminId: decoded.adminId,
            tokenType: "admin_access",
        };
    }

    toPublicData(
        admin: Admin
    ): AdminPublicData {
        return toPublicAdminData(admin);
    }
}

const adminAuthService = new AdminAuthService();

export default adminAuthService;