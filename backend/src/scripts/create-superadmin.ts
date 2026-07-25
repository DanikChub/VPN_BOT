import "dotenv/config";

import bcrypt from "bcryptjs";

import sequelize from "../database/sequelize";
import Admin from "../modules/admins/admin.model";

const PASSWORD_SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 12;

function getRequiredEnv(
    variableName: string
): string {
    const value = process.env[variableName]?.trim();

    if (!value) {
        throw new Error(
            `${variableName} is not configured`
        );
    }

    return value;
}

async function createSuperadmin(): Promise<void> {
    const email = getRequiredEnv(
        "SUPERADMIN_EMAIL"
    ).toLowerCase();

    const password = getRequiredEnv(
        "SUPERADMIN_PASSWORD"
    );

    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(
            `SUPERADMIN_PASSWORD must contain at least ${MIN_PASSWORD_LENGTH} characters`
        );
    }

    await sequelize.authenticate();

    const existingAdmin = await Admin
        .scope("withPasswordHash")
        .findOne({
            where: {
                email,
            },
        });

    if (existingAdmin) {
        throw new Error(
            `Administrator with email ${email} already exists`
        );
    }

    const passwordHash = await bcrypt.hash(
        password,
        PASSWORD_SALT_ROUNDS
    );

    const admin = await Admin.create({
        email,
        password_hash: passwordHash,
        role: "superadmin",
        status: "active",
        last_login_at: null,
    });

    console.log(
        `Superadmin created successfully: id=${admin.id}, email=${admin.email}`
    );
}

async function main(): Promise<void> {
    try {
        await createSuperadmin();
    } catch (error) {
        console.error(
            "Failed to create superadmin:",
            error
        );

        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

void main();