import vpnCredentialService
    from "./vpn-credential.service";


class VpnService {

    async getCredential(
        userId: number
    ) {
        return vpnCredentialService.get(
            userId
        );
    }


    async getOrCreateCredential(
        userId: number
    ) {
        return vpnCredentialService.getOrCreate(
            userId
        );
    }
}


export default new VpnService();