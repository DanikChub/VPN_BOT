import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";

class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare id: CreationOptional<number>;

    declare telegramId: string;
    declare username: string | null;
    declare firstName: string | null;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        telegramId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            field: "telegram_id",
        },

        username: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "first_name",
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
        tableName: "users",
        modelName: "User",
        timestamps: true,
    }
);

export default User;