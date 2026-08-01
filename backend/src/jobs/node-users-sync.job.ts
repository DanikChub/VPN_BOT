import type {
    NodeSyncService,
} from "../modules/vpn/node-sync.service";


class NodeUsersSyncJob {

    private isRunning =
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
            const result =
                await this.nodeSyncService
                    .syncAllNodes(
                        "reconcile",
                    );


            console.log(
                `[NODE_SYNC_JOB] Synchronized: ${result.synchronizedNodeIds.length}, failed: ${result.failedNodeIds.length}`,
            );
        } catch (error) {
            console.error(
                "[NODE_SYNC_JOB] Failed:",
                error instanceof Error
                    ? error.message
                    : error,
            );
        } finally {
            this.isRunning =
                false;
        }
    }
}


export default NodeUsersSyncJob;