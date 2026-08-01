import AdminNodesService
    from "./admin-nodes.service";


import {nodeSyncService} from "../../../infrastructure/container";


const adminNodesService =
    new AdminNodesService(
        nodeSyncService,
    );


export default adminNodesService;