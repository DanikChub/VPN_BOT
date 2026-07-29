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
            fp: "firefox",
            sni: node.reality_server_name,
            sid: node.reality_short_id,
            spx: "%2F",
            flow: "xtls-rprx-vision",
        });

        return (
            `#profile-title: IORDAN VPN\n` +
            `vless://${credential.uuid}` +
            `@${node.host}:${node.port}` +
            `?${params.toString()}` +
            `#${encodeURIComponent(node.name)}` +
             '%F0%9F%87%B7%F0%9F%87%BA'
        );
    }
}

export default new VlessUrlService();