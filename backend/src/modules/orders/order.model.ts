import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";

export type OrderStatus =
    | "pending"
    | "paid"
    | "cancelled"
    | "expired";

class Order extends Model<
    InferAttributes<Order>,
    InferCreationAttributes<Order>
> {
    declare id: CreationOptional<number>;

    declare user_id: number;
    declare plan_id: number;

    declare amount: number;
    declare currency: string;

    declare status: CreationOptional<OrderStatus>;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        plan_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM(
                "pending",
                "paid",
                "cancelled",
                "expired"
            ),
            allowNull: false,
            defaultValue: "pending",
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
        tableName: "orders",
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Order;