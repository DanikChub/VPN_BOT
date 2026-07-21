import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";

export type PaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "cancelled"
    | "expired";

class Payment extends Model<
    InferAttributes<Payment>,
    InferCreationAttributes<Payment>
> {
    declare id: CreationOptional<number>;

    declare order_id: number;

    declare payment_method_id: number;

    declare payment_url:
        | string
        | null;

    declare expires_at:
        | Date
        | null;

    declare provider_payment_id:
        | string
        | null;

    declare amount: number;
    declare currency: string;

    declare status: CreationOptional<PaymentStatus>;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

Payment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        payment_method_id: {
            type: DataTypes.INTEGER,
                allowNull: false,
        },

        provider_payment_id: {
            type: DataTypes.STRING,
                allowNull: true,
        },

        payment_url: {
            type: DataTypes.TEXT,
                allowNull: true,
        },

        expires_at: {
            type: DataTypes.DATE,
                allowNull: true,
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
                "successful",
                "failed",
                "cancelled"
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
        tableName: "payments",
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Payment;