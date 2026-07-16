import { Sequelize } from "sequelize";

import { env } from "../config/env";

const sequelize = new Sequelize(
    env.database.name,
    env.database.user,
    env.database.password,
    {
        host: env.database.host,
        port: env.database.port,
        dialect: "postgres",
        logging: false,
    }
)

export default sequelize;