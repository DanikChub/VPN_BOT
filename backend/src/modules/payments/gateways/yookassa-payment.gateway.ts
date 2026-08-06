import {
    randomUUID,
} from "node:crypto";

import axios, {
    type AxiosInstance,
} from "axios";

import type {
    CheckPaymentResult,
    CreatePaymentInput,
    CreatePaymentResult,
    GatewayPaymentStatus,
    GatewayWebhookInput,
    GatewayWebhookResult,
    PaymentGateway,
} from "../payment-gateway.interface";


type YooKassaPaymentStatus =
    | "pending"
    | "waiting_for_capture"
    | "succeeded"
    | "canceled";


interface YooKassaAmount {
    value: string;
    currency: string;
}


interface YooKassaConfirmation {
    type: string;

    confirmation_url?: string;
}


interface YooKassaCancellationDetails {
    party?: string;
    reason?: string;
}


interface YooKassaPayment {
    id: string;

    status:
        YooKassaPaymentStatus;

    paid: boolean;

    amount:
        YooKassaAmount;

    confirmation?:
        YooKassaConfirmation;

    description?:
        string;

    metadata?: {
        paymentId?: unknown;

        [key: string]:
            unknown;
    };

    expires_at?:
        string;

    cancellation_details?:
        YooKassaCancellationDetails;

    test?:
        boolean;
}


interface YooKassaWebhook {
    type:
        | "notification"
        | string;

    event:
        | "payment.succeeded"
        | "payment.canceled"
        | "payment.waiting_for_capture"
        | string;

    object:
        YooKassaPayment;
}


class YooKassaPaymentGateway
    implements PaymentGateway {

    readonly name =
        "yoo_kassa";


    private readonly api:
        AxiosInstance;


    private readonly returnUrl:
        string;


    constructor() {
        const shopId =
            process.env.YOOKASSA_SHOP_ID;

        const secretKey =
            process.env.YOOKASSA_SECRET_KEY;

        const baseURL =
            process.env.YOOKASSA_API_URL ??
            "https://api.yookassa.ru/v3";

        const returnUrl =
            process.env.YOOKASSA_RETURN_URL;


        if (!shopId) {
            throw new Error(
                "YOOKASSA_SHOP_ID is not configured"
            );
        }


        if (!secretKey) {
            throw new Error(
                "YOOKASSA_SECRET_KEY is not configured"
            );
        }


        if (!returnUrl) {
            throw new Error(
                "YOOKASSA_RETURN_URL is not configured"
            );
        }


        this.returnUrl =
            returnUrl;


        this.api =
            axios.create({
                baseURL,

                timeout:
                    15_000,

                auth: {
                    username:
                    shopId,

                    password:
                    secretKey,
                },

                headers: {
                    "Content-Type":
                        "application/json",

                    Accept:
                        "application/json",
                },
            });
    }


    async createPayment(
        input: CreatePaymentInput
    ): Promise<CreatePaymentResult> {
        const response =
            await this.api.post<
                YooKassaPayment
            >(
                "/payments",
                {
                    amount: {
                        value:
                            this.formatAmount(
                                input.amount
                            ),

                        currency:
                            input.currency
                                .toUpperCase(),
                    },

                    /*
                     * Одностадийный платёж:
                     * после успешной оплаты
                     * статус станет succeeded.
                     */
                    capture:
                        true,

                    confirmation: {
                        type:
                            "redirect",

                        return_url:
                        this.returnUrl,
                    },

                    description:
                    input.description,

                    metadata: {
                        /*
                         * Внутренний Payment.id.
                         * Вернётся в webhook.
                         */
                        paymentId:
                            String(
                                input.paymentId
                            ),
                    },
                },
                {
                    headers: {
                        /*
                         * ЮKassa требует ключ
                         * идемпотентности для создания.
                         */
                        "Idempotence-Key":
                            randomUUID(),
                    },
                }
            );


        const payment =
            response.data;

        if (!payment.id) {
            throw new Error(
                "YooKassa payment ID is missing"
            );
        }


        const paymentUrl =
            payment.confirmation
                ?.confirmation_url ??
            null;


        if (
            payment.status === "pending" &&
            !paymentUrl
        ) {
            throw new Error(
                "YooKassa confirmation URL is missing"
            );
        }


        return {
            externalPaymentId:
            payment.id,

            paymentUrl,
        };
    }


    async checkPayment(
        externalPaymentId: string
    ): Promise<CheckPaymentResult> {
        const response =
            await this.api.get<
                YooKassaPayment
            >(
                `/payments/${encodeURIComponent(
                    externalPaymentId
                )}`
            );


        const payment =
            response.data;


        if (
            payment.id !==
            externalPaymentId
        ) {
            throw new Error(
                "YooKassa payment ID mismatch"
            );
        }


        return {
            externalPaymentId:
            payment.id,

            status:
                this.mapStatus(
                    payment
                ),
        };
    }


    async parseWebhook(
        input: GatewayWebhookInput
    ): Promise<GatewayWebhookResult> {
        if (
            !input.body ||
            typeof input.body !== "object"
        ) {
            throw new Error(
                "Invalid YooKassa webhook body"
            );
        }


        const webhook =
            input.body as Partial<
                YooKassaWebhook
            >;


        if (
            webhook.type !==
            "notification"
        ) {
            return {
                handled:
                    false,

                paymentId:
                    null,

                externalPaymentId:
                    null,
            };
        }


        /*
         * Нас интересуют оба финальных
         * события. PaymentService затем
         * сам вызовет checkPayment().
         */
        if (
            webhook.event !==
            "payment.succeeded" &&
            webhook.event !==
            "payment.canceled"
        ) {
            return {
                handled:
                    false,

                paymentId:
                    null,

                externalPaymentId:
                    null,
            };
        }


        const payment =
            webhook.object;


        if (
            !payment ||
            typeof payment !== "object"
        ) {
            throw new Error(
                "YooKassa webhook payment object is missing"
            );
        }


        if (
            typeof payment.id !==
            "string" ||
            !payment.id
        ) {
            throw new Error(
                "YooKassa external payment ID is missing"
            );
        }


        const paymentId =
            Number(
                payment.metadata
                    ?.paymentId
            );


        if (
            !Number.isInteger(
                paymentId
            ) ||
            paymentId <= 0
        ) {
            throw new Error(
                "Invalid paymentId in YooKassa webhook metadata"
            );
        }


        return {
            handled:
                true,

            paymentId,

            externalPaymentId:
            payment.id,
        };
    }


    private formatAmount(
        amount: number
    ): string {
        if (
            !Number.isInteger(amount) ||
            amount < 0
        ) {
            throw new Error(
                "Payment amount must be a non-negative integer"
            );
        }

        return (
            amount / 100
        ).toFixed(2);
    }


    private mapStatus(
        payment: YooKassaPayment
    ): GatewayPaymentStatus {
        switch (payment.status) {
            case "pending":
            case "waiting_for_capture":
                return "pending";


            case "succeeded":
                return "paid";


            case "canceled":
                return this.mapCanceledStatus(
                    payment
                );


            default:
                return "failed";
        }
    }


    private mapCanceledStatus(
        payment: YooKassaPayment
    ): GatewayPaymentStatus {
        const reason =
            payment
                .cancellation_details
                ?.reason;


        /*
         * Эти причины означают, что
         * пользователь не успел закончить
         * подтверждение или capture.
         */
        if (
            reason ===
            "expired_on_confirmation" ||
            reason ===
            "expired_on_capture"
        ) {
            return "expired";
        }


        /*
         * ЮKassa использует общий статус
         * canceled как для отказа клиента,
         * так и для отклонения операции.
         * Для нашей модели разумнее хранить
         * это как cancelled.
         */
        return "cancelled";
    }
}


export default new YooKassaPaymentGateway();