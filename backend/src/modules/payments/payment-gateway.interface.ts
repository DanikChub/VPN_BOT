export interface CreatePaymentInput {
    paymentId: number;

    amount: number;
    currency: string;

    description: string;
}

export interface CreatePaymentResult {
    externalPaymentId: string;

    paymentUrl: string | null;
}

export type GatewayPaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "cancelled"
    | "expired";

export interface CheckPaymentResult {
    externalPaymentId: string;

    status: GatewayPaymentStatus;
}

export interface PaymentGateway {
    readonly name: string;

    createPayment(
        input: CreatePaymentInput
    ): Promise<CreatePaymentResult>;

    checkPayment(
        externalPaymentId: string
    ): Promise<CheckPaymentResult>;
}