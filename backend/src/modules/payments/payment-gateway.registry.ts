import {
    PaymentGateway
} from "./payment-gateway.interface";

import cryptoPaymentGateway
    from "./gateways/crypto-payment.gateway";

import testPaymentGateway
    from "./gateways/test-payment.gateway";


const gateways:
    Record<string, PaymentGateway> = {

    crypto_bot:
    cryptoPaymentGateway,

    test:
    testPaymentGateway,
};


class PaymentGatewayRegistry {

    get(
        code: string
    ): PaymentGateway {

        const gateway =
            gateways[code];


        if (!gateway) {
            throw new Error(
                `Payment gateway "${code}" is not registered`
            );
        }


        return gateway;
    }
}


export default new PaymentGatewayRegistry();