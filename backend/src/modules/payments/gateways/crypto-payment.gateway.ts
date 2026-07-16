
import {
    PaymentGateway,
    CreatePaymentInput,
    CreatePaymentResult
} from "../payment-gateway.interface";
import axios from "axios";


class CryptoPaymentGateway
    implements PaymentGateway {


    readonly name = "crypto_bot";


    async createPayment(
        input: CreatePaymentInput
    ): Promise<CreatePaymentResult> {


        const response =
            await axios.post(
                `${process.env.CRYPTO_PAY_URL}/createInvoice`,
                {
                    asset: "USDT",

                    amount:
                    input.amount,

                    description:
                    input.description,

                    payload:
                        JSON.stringify({
                            paymentId:
                            input.paymentId
                        }),

                    expires_in:3600
                },
                {
                    headers:{
                        "Crypto-Pay-API-Token":
                        process.env.CRYPTO_PAY_TOKEN
                    }
                }
            );


        const invoice =
            response.data.result;


        return {

            externalPaymentId:
                String(invoice.invoice_id),

            paymentUrl:
            invoice.pay_url
        };
    }

}


export default new CryptoPaymentGateway();