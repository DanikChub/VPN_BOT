
import {
    nodeSyncService,
} from "../infrastructure/container";

import SubscriptionExpirationJob from "./subscription-expiration.job";
import NodeStatusJob from "./node-status.job";
import NodeUsersSyncJob from "./node-users-sync.job";





export const nodeUsersSyncJob =
    new NodeUsersSyncJob(
        nodeSyncService,
    );

export const subscriptionExpirationJob =
    new SubscriptionExpirationJob(
        nodeSyncService,
    );

export const nodeStatusJob =
    new NodeStatusJob();
