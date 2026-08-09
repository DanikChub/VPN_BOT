
import {
    nodeUsersSyncJob,
    subscriptionExpirationJob,
    nodeStatusJob
} from "./jobs.instance";

// 1 час
const SUBSCRIPTION_EXPIRATION_INTERVAL_MS =
    60 * 60 * 1_000;

// 1 час
const NODE_USERS_SYNC_INTERVAL_MS =
    60 * 60 * 1_000;

// 30 секунд
const NODE_STATUS_INTERVAL_MS = 30_000;


export const startJobs = (): void => {

    // Проверка подписки
    void subscriptionExpirationJob.run();
    setInterval(() => {
        void subscriptionExpirationJob.run();
    }, SUBSCRIPTION_EXPIRATION_INTERVAL_MS);

    // Страховочная синхронизация
    setInterval(() => {
        void nodeUsersSyncJob.run();
    }, NODE_USERS_SYNC_INTERVAL_MS);

    // Проверка статуса
    void nodeStatusJob.run();
    setInterval(() => {
        void nodeStatusJob.run();
    }, NODE_STATUS_INTERVAL_MS);
};