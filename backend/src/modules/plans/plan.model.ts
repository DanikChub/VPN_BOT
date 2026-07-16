import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";

class Plan extends Model<
    InferAttributes<Plan>,
    InferCreationAttributes<Plan>
> {
    declare id: CreationOptional<number>;

    declare name: string;
    declare duration_days: number;

    declare price_amount: number;
    declare currency: string;

    declare is_active: CreationOptional<boolean>;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

Plan.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        duration_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        price_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "plans",
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Plan;