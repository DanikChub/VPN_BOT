import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";
import User from "../users/user.model";

class Subscription extends Model<
    InferAttributes<Subscription>,
    InferCreationAttributes<Subscription>
> {
    declare id: CreationOptional<number>;

    declare user_id: ForeignKey<User["id"]>;

    declare status: CreationOptional<
        "active" | "expired" | "blocked"
    >;

    declare expires_at: Date;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Subscription.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        status: {
            type: DataTypes.ENUM(
                "active",
                "expired",
                "blocked"
            ),
            allowNull: false,
            defaultValue: "active",
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "created_at",
        },

        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "updated_at",
        },
    },
    {
        sequelize,
        tableName: "subscriptions",
        modelName: "Subscription",
        timestamps: true,
        underscored: true,
    }
);

export default Subscription;