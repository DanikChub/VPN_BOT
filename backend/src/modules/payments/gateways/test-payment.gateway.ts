import {
    CheckPaymentResult,
    CreatePaymentInput,
    CreatePaymentResult,
    GatewayWebhookInput,
    GatewayWebhookResult,
    PaymentGateway,
} from "../payment-gateway.interface";


interface TestPaymentWebhookBody {
    event?: unknown;

    paymentId?: unknown;

    externalPaymentId?: unknown;
}


class TestPaymentGateway
    implements PaymentGateway {

    readonly name =
        "test";


    private ensureEnabled(): void {
        if (
            process.env.NODE_ENV ===
            "production" ||
            process.env.ENABLE_TEST_PAYMENTS !==
            "true"
        ) {
            throw new Error(
                "Test payments are disabled"
            );
        }
    }


    async createPayment(
        input: CreatePaymentInput
    ): Promise<CreatePaymentResult> {
        this.ensureEnabled();


        return {
            externalPaymentId:
                `test_${input.paymentId}`,

            paymentUrl:
                null,
        };
    }


    async checkPayment(
        externalPaymentId: string
    ): Promise<CheckPaymentResult> {
        this.ensureEnabled();


        if (
            !externalPaymentId.startsWith(
                "test_"
            )
        ) {
            throw new Error(
                "Invalid test payment ID"
            );
        }


        const paymentId =
            Number(
                externalPaymentId.replace(
                    "test_",
                    ""
                )
            );


        if (
            !Number.isInteger(paymentId) ||
            paymentId <= 0
        ) {
            throw new Error(
                "Invalid payment ID in test payment identifier"
            );
        }


        /*
         * Тестовый gateway всегда подтверждает
         * корректно созданный тестовый платёж.
         */
        return {
            externalPaymentId,

            status:
                "paid",
        };
    }


    async parseWebhook(
        input: GatewayWebhookInput
    ): Promise<GatewayWebhookResult> {
        this.ensureEnabled();


        if (
            !input.body ||
            typeof input.body !==
            "object" ||
            Array.isArray(input.body)
        ) {
            throw new Error(
                "Invalid test webhook body"
            );
        }


        const body =
            input.body as TestPaymentWebhookBody;


        if (
            typeof body.event !==
            "string"
        ) {
            throw new Error(
                "Test webhook event is missing"
            );
        }


        /*
         * События, которые webhook-контроллер
         * должен принять, но не обрабатывать.
         */
        if (
            body.event !==
            "payment.paid"
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


        const paymentId =
            Number(
                body.paymentId
            );


        if (
            !Number.isInteger(paymentId) ||
            paymentId <= 0
        ) {
            throw new Error(
                "Invalid paymentId in test webhook"
            );
        }


        const expectedExternalPaymentId =
            `test_${paymentId}`;


        const externalPaymentId =
            body.externalPaymentId ===
            undefined
                ? expectedExternalPaymentId
                : String(
                    body.externalPaymentId
                );


        if (
            externalPaymentId !==
            expectedExternalPaymentId
        ) {
            throw new Error(
                "Test webhook external payment ID mismatch"
            );
        }


        return {
            handled:
                true,

            paymentId,

            externalPaymentId,
        };
    }
}


export default new TestPaymentGateway();