import type {
    NodeSyncService,
} from "../modules/vpn/node-sync.service";

import subscriptionService
    from "../modules/subscriptions/subscription.service";


class SubscriptionExpirationJob {

    private isRunning =
        false;

    private syncPending =
        false;


    public constructor(
        private readonly nodeSyncService:
        NodeSyncService,
    ) {}


    public async run():
        Promise<void> {


        if (this.isRunning) {
            return;
        }


        this.isRunning =
            true;


        try {
            const expiredCount =
                await subscriptionService
                    .expireOverdue();


            if (expiredCount > 0) {
                this.syncPending =
                    true;


                console.log(
                    "[SUBSCRIPTIONS_JOB] Subscriptions expired",
                    {
                        expiredCount,
                    },
                );
            }


            if (!this.syncPending) {
                return;
            }


            console.log(
                "[SUBSCRIPTIONS_JOB] Starting nodes synchronization",
                {
                    reason:
                        "subscription-expiration",
                },
            );


            const startedAt =
                Date.now();


            /*
             * ВАЖНО: здесь должны быть скобки.
             */
            const result =
                await this.nodeSyncService
                    .syncAllNodes(
                        "reconcile",
                    );


            console.log(
                "[SUBSCRIPTIONS_JOB] Nodes synchronization completed",
                {
                    reason:
                        "subscription-expiration",

                    synchronizedNodeIds:
                    result.synchronizedNodeIds,

                    failedNodeIds:
                    result.failedNodeIds,

                    durationMs:
                        Date.now() -
                        startedAt,
                },
            );


            if (
                result.failedNodeIds.length > 0
            ) {
                throw new Error(
                    `Failed to synchronize nodes: ${result.failedNodeIds.join(", ")}`,
                );
            }


            this.syncPending =
                false;
        } catch (error) {
            console.error(
                "[SUBSCRIPTIONS_JOB] Failed",
                {
                    syncPending:
                    this.syncPending,

                    error:
                        error instanceof Error
                            ? {
                                name:
                                error.name,

                                message:
                                error.message,

                                stack:
                                error.stack,
                            }
                            : error,
                },
            );
        } finally {
            this.isRunning =
                false;
        }
    }
}


export default SubscriptionExpirationJob;