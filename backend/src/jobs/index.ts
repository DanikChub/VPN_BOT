
import {nodeUsersSyncJob, subscriptionExpirationJob} from "./jobs.instance";


const SUBSCRIPTION_EXPIRATION_INTERVAL_MS =
    60 * 60 * 1_000;

const NODE_USERS_SYNC_INTERVAL_MS =
    60 * 60 * 1_000;


export const startJobs = (): void => {

    void subscriptionExpirationJob.run();

    setInterval(() => {
        void subscriptionExpirationJob.run();
    }, SUBSCRIPTION_EXPIRATION_INTERVAL_MS);


    setInterval(() => {
        void nodeUsersSyncJob.run();
    }, NODE_USERS_SYNC_INTERVAL_MS);
};