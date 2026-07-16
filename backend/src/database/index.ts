import sequelize from "./sequelize";
import { initAssociations } from "./associations";

export const initDatabase = async (): Promise<void> => {
    initAssociations();

    await sequelize.authenticate();

    console.log("Database connected");

    await sequelize.sync();

    console.log("Database synchronized");
};