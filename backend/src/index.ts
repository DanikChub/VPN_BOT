import "dotenv/config";

import app from "./app";
import { initDatabase } from "./database";
import {startJobs} from "./jobs";


const PORT = Number(process.env.PORT) || 5000;

const start = async (): Promise<void> => {
    try {
        await initDatabase();

        startJobs();



        app.listen(PORT, () => {
            console.log(
                `Backend started on port ${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Failed to start backend:",
            error
        );

        process.exit(1);
    }
};

void start();