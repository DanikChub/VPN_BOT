import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";


class MarketingSource extends Model<
    InferAttributes<MarketingSource>,
    InferCreationAttributes<MarketingSource>
> {

    declare id: CreationOptional<number>;


    /**
     * Уникальный код для Telegram start payload
     *
     * пример:
     * tg_ivan_august
     * tiktok_video_1
     */
    declare code: string;


    /**
     * Человеческое название для админки
     *
     * пример:
     * Telegram канал Иван
     * TikTok ролик 14.08
     */
    declare name: string;


    /**
     * Тип источника
     */
    declare type:
        | "telegram"
        | "tiktok"
        | "blogger"
        | "friend"
        | "other";


    declare is_active: CreationOptional<boolean>;


    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}


MarketingSource.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },


        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },


        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },


        type: {
            type: DataTypes.ENUM(
                "telegram",
                "tiktok",
                "blogger",
                "friend",
                "other",
            ),
            allowNull: false,
            defaultValue: "other",
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
        tableName: "marketing_sources",

        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);


export default MarketingSource;