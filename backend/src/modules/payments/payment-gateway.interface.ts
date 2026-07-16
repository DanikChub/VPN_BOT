export interface CreatePaymentInput {
    paymentId: number;

    amount: number;
    currency: string;

    description: string;
}

export interface CreatePaymentResult {
    externalPaymentId: string;
    paymentUrl: string;
}

export interface PaymentGateway {
    readonly name: string;

    createPayment(
        input: CreatePaymentInput
    ): Promise<CreatePaymentResult>;
}