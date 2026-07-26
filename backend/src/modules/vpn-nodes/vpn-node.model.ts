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

    declare inbound_tag: CreationOptional<string>;

    declare is_active: CreationOptional<boolean>;

    declare status: CreationOptional<
        "online" | "offline"
    >;

    declare last_seen_at: Date | null;

    declare cpu_count: number | null;
    declare cpu_model: string | null;

    declare memory_total: number | null;
    declare memory_used: number | null;

    declare uptime_seconds: number | null;

    declare install_status: CreationOptional<
        "pending"
        | "installing"
        | "waiting_agent"
        | "ready"
        | "failed"
    >;

    declare agent_token: string | null;

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

        status: {
            type: DataTypes.ENUM(
                "online",
                "offline",
            ),
            allowNull: false,
            defaultValue: "offline",
        },

        last_seen_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        cpu_count: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        cpu_model: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        memory_total: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },

        memory_used: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },

        uptime_seconds: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },

        install_status: {
            type: DataTypes.ENUM(
                "pending",
                "installing",
                "waiting_agent",
                "ready",
                "failed",
            ),
            allowNull: false,
            defaultValue: "pending",
        },

        agent_token: {
            type: DataTypes.STRING,
            allowNull: true,
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
        timestamps: false,
    }
);

export default VpnNode;