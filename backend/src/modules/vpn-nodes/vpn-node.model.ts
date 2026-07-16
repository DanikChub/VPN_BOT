import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";

class VpnNode extends Model<
    InferAttributes<VpnNode>,
    InferCreationAttributes<VpnNode>
> {
    declare id: CreationOptional<number>;

    declare name: string;
    declare host: string;
    declare port: number;

    declare reality_public_key: string;
    declare reality_server_name: string;
    declare reality_short_id: string;

    declare inbound_tag: string;

    declare is_active: CreationOptional<boolean>;

    declare ssh_port: CreationOptional<number>;
    declare ssh_user: CreationOptional<string>;
}

VpnNode.init(
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

        host: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        port: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 443,
        },

        reality_public_key: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        reality_server_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        reality_short_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        inbound_tag: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "vless-reality-in",
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        ssh_port: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 22,
        },

        ssh_user: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "root",
        },
    },
    {
        sequelize,
        tableName: "vpn_nodes",
        underscored: true,
    }
);

export default VpnNode;