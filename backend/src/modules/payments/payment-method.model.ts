import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";

class PaymentMethod extends Model<
    InferAttributes<PaymentMethod>,
    InferCreationAttributes<PaymentMethod>
> {
    declare id: CreationOptional<number>;

    declare code: string;
    declare name: string;

    declare is_active: CreationOptional<boolean>;
    declare sort_order: CreationOptional<number>;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

PaymentMethod.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        sort_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
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
        tableName: "payment_methods",
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default PaymentMethod;