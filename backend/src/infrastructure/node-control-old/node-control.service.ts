import VpnCredential from "../../modules/vpn/vpn-credential.model";
import VpnNode from "../../modules/vpn-nodes/vpn-node.model";

export interface NodeControlService {
    addUser(
        node: VpnNode,
        credential: VpnCredential
    ): Promise<void>;

    removeUser(
        node: VpnNode,
        credential: VpnCredential
    ): Promise<void>;
}