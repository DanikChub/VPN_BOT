import type {
    AddUsersCommandResult,
    RemoveUsersCommandResult,
    SyncUsersCommandResult,
    SyncUsersMode,
} from "@vpn/common";
import VpnNode from "../../vpn-nodes/vpn-node.model";
import VpnCredential from "../vpn-credential.model";


export interface NodeControlService {

    addUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<AddUsersCommandResult>;


    removeUser(
        node: VpnNode,
        credential: VpnCredential,
    ): Promise<RemoveUsersCommandResult>;


    syncUsers(
        node: VpnNode,
        credentials: VpnCredential[],
        mode?: SyncUsersMode,
    ): Promise<SyncUsersCommandResult>;
}