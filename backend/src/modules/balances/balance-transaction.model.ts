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


export type BalanceTransactionType =
    | "deposit"
    | "bonus"
    | "subscription_charge"
    | "refund"
    | "manual_adjustment";

class BalanceTransaction extends Model<
    InferAttributes<BalanceTransaction>,
    InferCreationAttributes<BalanceTransaction>
> {
    declare id: CreationOptional<number>;

    declare user_id: ForeignKey<User["id"]>;

    /**
     * Сумма в копейках.
     *
     * Положительное значение — пополнение.
     * Отрицательное значение — списание.
     */
    declare amount: number;

    declare type: BalanceTransactionType;

    declare description: string | null;


    declare idempotency_key: string;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

BalanceTransaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        amount: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        type: {
            type: DataTypes.ENUM(
                "deposit",
                "bonus",
                "subscription_charge",
                "refund",
                "manual_adjustment"
            ),
            allowNull: false,
        },

        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        idempotency_key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
        tableName: "balance_transactions",
        underscored: true,
    }
);


export default BalanceTransaction;