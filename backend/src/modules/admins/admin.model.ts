import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";

export type AdminRole =
    | "superadmin"
    | "admin"
    | "support";

export type AdminStatus =
    | "active"
    | "blocked";

class Admin extends Model<
    InferAttributes<Admin>,
    InferCreationAttributes<Admin>
> {
    declare id: CreationOptional<number>;

    declare email: string;
    declare password_hash: string;

    declare role: CreationOptional<AdminRole>;
    declare status: CreationOptional<AdminStatus>;

    declare last_login_at: Date | null;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

Admin.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },

        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        role: {
            type: DataTypes.ENUM(
                "superadmin",
                "admin",
                "support"
            ),
            allowNull: false,
            defaultValue: "admin",
        },

        status: {
            type: DataTypes.ENUM(
                "active",
                "blocked"
            ),
            allowNull: false,
            defaultValue: "active",
        },

        last_login_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "admins",
        modelName: "Admin",

        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                fields: ["email"],
            },
            {
                fields: ["role"],
            },
            {
                fields: ["status"],
            },
        ],

        defaultScope: {
            attributes: {
                exclude: ["password_hash"],
            },
        },

        scopes: {
            withPasswordHash: {
                attributes: {
                    include: ["password_hash"],
                },
            },
        },
    }
);

export default Admin;