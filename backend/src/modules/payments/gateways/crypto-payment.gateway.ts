import axios, {
    AxiosInstance
} from "axios";

import {
    CheckPaymentResult,
    CreatePaymentInput,
    CreatePaymentResult,
    PaymentGateway
} from "../payment-gateway.interface";


interface CryptoPayResponse<T> {
    ok: boolean;

    result?: T;

    error?: {
        code: number;
        name: string;
    };
}


interface CryptoPayInvoice {
    invoice_id: number;

    status:
        | "active"
        | "paid"
        | "expired";

    bot_invoice_url: string;

    mini_app_invoice_url?: string;
    web_app_invoice_url?: string;

    amount: string;

    currency_type:
        | "crypto"
        | "fiat";

    fiat?: string;
    asset?: string;

    payload?: string;
    expiration_date?: string;
}


interface CryptoPayInvoicesResult {
    items: CryptoPayInvoice[];
}


class CryptoPaymentGateway
    implements PaymentGateway {

    readonly name =
        "crypto_bot";


    private readonly api:
        AxiosInstance;


    constructor() {
        const token =
            process.env.CRYPTO_PAY_TOKEN;

        const baseURL =
            process.env.CRYPTO_PAY_API_URL;


        if (!token) {
            throw new Error(
                "CRYPTO_PAY_TOKEN is not configured"
            );
        }


        if (!baseURL) {
            throw new Error(
                "CRYPTO_PAY_API_URL is not configured"
            );
        }


        this.api =
            axios.create({
                baseURL,

                timeout:
                    10_000,

                headers: {
                    "Crypto-Pay-API-Token":
                    token,

                    "Content-Type":
                        "application/json",
                },
            });
    }


    async createPayment(
        input: CreatePaymentInput
    ): Promise<CreatePaymentResult> {

        const response =
            await this.api.post<
                CryptoPayResponse<CryptoPayInvoice>
            >(
                "/createInvoice",
                {
                    currency_type:
                        "fiat",

                    fiat:
                    input.currency,

                    amount:
                        (
                            input.amount / 100
                        ).toFixed(2),

                    accepted_assets:
                        "USDT,TON",

                    description:
                    input.description,

                    payload:
                        JSON.stringify({
                            paymentId:
                            input.paymentId,
                        }),

                    expires_in:
                        1800,

                    allow_comments:
                        false,

                    allow_anonymous:
                        false,
                }
            );


        if (
            !response.data.ok ||
            !response.data.result
        ) {
            throw new Error(
                `Crypto Pay error: ${
                    response.data.error?.name
                    ?? "UNKNOWN_ERROR"
                }`
            );
        }


        const invoice =
            response.data.result;


        return {
            externalPaymentId:
                String(
                    invoice.invoice_id
                ),

            paymentUrl:
            invoice.bot_invoice_url,
        };
    }


    async checkPayment(
        externalPaymentId: string
    ): Promise<CheckPaymentResult> {

        const invoice =
            await this.getInvoice(
                externalPaymentId
            );


        if (!invoice) {
            throw new Error(
                "Crypto Pay invoice not found"
            );
        }


        const invoiceId =
            String(
                invoice.invoice_id
            );


        if (
            invoiceId !==
            externalPaymentId
        ) {
            throw new Error(
                "Provider payment ID mismatch"
            );
        }


        switch (invoice.status) {

            case "active":
                return {
                    externalPaymentId:
                    invoiceId,

                    status:
                        "pending",
                };


            case "paid":
                return {
                    externalPaymentId:
                    invoiceId,

                    status:
                        "paid",
                };


            case "expired":
                return {
                    externalPaymentId:
                    invoiceId,

                    status:
                        "expired",
                };


            default:
                return {
                    externalPaymentId:
                    invoiceId,

                    status:
                        "failed",
                };
        }
    }


    private async getInvoice(
        externalPaymentId: string
    ): Promise<CryptoPayInvoice | null> {

        const response =
            await this.api.get<
                CryptoPayResponse<
                    CryptoPayInvoicesResult
                >
            >(
                "/getInvoices",
                {
                    params: {
                        invoice_ids:
                        externalPaymentId,
                    },
                }
            );


        if (
            !response.data.ok ||
            !response.data.result
        ) {
            throw new Error(
                `Crypto Pay error: ${
                    response.data.error?.name
                    ?? "UNKNOWN_ERROR"
                }`
            );
        }


        return (
            response.data.result.items[0]
            ?? null
        );
    }
}


export default new CryptoPaymentGateway();