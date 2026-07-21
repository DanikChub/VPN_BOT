import {
    CheckPaymentResult,
    CreatePaymentInput,
    CreatePaymentResult,
    PaymentGateway
} from "../payment-gateway.interface";


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


        return {
            externalPaymentId,

            status:
                "paid",
        };
    }
}


export default new TestPaymentGateway();