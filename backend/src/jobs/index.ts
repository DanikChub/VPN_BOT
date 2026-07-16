import subscriptionExpirationJob from "./subscription-expiration.job";

export const startJobs = (): void => {
    void subscriptionExpirationJob.run();

    setInterval(() => {
        void subscriptionExpirationJob.run();
    }, 60_000);
};