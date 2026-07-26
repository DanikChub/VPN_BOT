import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import sequelize from "../../database/sequelize";


export type NodeInstallStep =
    | "ssh_connect"
    | "install_node"
    | "install_xray"
    | "configure_xray"
    | "install_agent"
    | "completed";


export type NodeInstallStatus =
    | "running"
    | "success"
    | "failed";


class NodeInstallLog extends Model<
    InferAttributes<NodeInstallLog>,
    InferCreationAttributes<NodeInstallLog>
> {

    declare id: CreationOptional<number>;

    declare node_id:number;

    declare step:NodeInstallStep;

    declare status:NodeInstallStatus;

    declare message:string | null;

    declare error:string | null;

    declare created_at:CreationOptional<Date>;

    declare updated_at:CreationOptional<Date>;
}



NodeInstallLog.init(

    {

        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
        },


        node_id:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },


        step:{
            type:DataTypes.STRING,
            allowNull:false,
        },


        status:{
            type:DataTypes.STRING,
            allowNull:false,
        },


        message:{
            type:DataTypes.TEXT,
            allowNull:true,
        },


        error:{
            type:DataTypes.TEXT,
            allowNull:true,
        },


        created_at:{
            type:DataTypes.DATE,
            defaultValue:DataTypes.NOW,
        },


        updated_at:{
            type:DataTypes.DATE,
            defaultValue:DataTypes.NOW,
        },


    },

    {
        sequelize,

        tableName:"node_install_logs",

        timestamps:true,

        createdAt:"created_at",

        updatedAt:"updated_at",
    }

);


export default NodeInstallLog;