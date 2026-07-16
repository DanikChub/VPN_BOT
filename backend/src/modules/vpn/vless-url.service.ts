import VpnCredential from "./vpn-credential.model";
import VpnNode from "../vpn-nodes/vpn-node.model";


class VlessUrlService {
    build(
        credential: VpnCredential,
        node: VpnNode
    ): string {
        const params = new URLSearchParams({
            type: "tcp",
            security: "reality",
            pbk: node.reality_public_key,
            fp: "chrome",
            sni: node.reality_server_name,
            sid: node.reality_short_id,
            flow: "xtls-rprx-vision",
        });

        return (
            `vless://${credential.uuid}` +
            `@${node.host}:${node.port}` +
            `?${params.toString()}` +
            `#${encodeURIComponent(node.name)}`
        );
    }
}

export default new VlessUrlService();