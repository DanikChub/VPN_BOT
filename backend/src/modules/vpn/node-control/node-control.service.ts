import type {
    SyncUsersMode,
} from "@vpn/common";

import VpnCredential
    from "../vpn-credential.model";

import VpnNode
    from "../../vpn-nodes/vpn-node.model";

export interface NodeControlService {
    addUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<void>;

    removeUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<void>;

    syncUsers(
        node: VpnNode,
        credentials: VpnCredential[],
        mode?: SyncUsersMode,
    ): Promise<void>;
}