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

class VpnCredential extends Model<
    InferAttributes<VpnCredential>,
    InferCreationAttributes<VpnCredential>
> {
    declare id: CreationOptional<number>;

    declare user_id: ForeignKey<User["id"]>;

    declare uuid: string;

    declare subscription_token: string;
}

VpnCredential.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
        },

        subscription_token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: "vpn_credentials",
        underscored: true,
    }
);

export default VpnCredential;