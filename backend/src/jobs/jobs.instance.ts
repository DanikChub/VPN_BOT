import NodeUsersSyncJob
    from "./node-users-sync.job";


import {
    nodeSyncService,
} from "../infrastructure/container";
import SubscriptionExpirationJob from "./subscription-expiration.job";




export const nodeUsersSyncJob =
    new NodeUsersSyncJob(
        nodeSyncService,
    );

export const subscriptionExpirationJob =
    new SubscriptionExpirationJob(
        nodeSyncService,
    );


