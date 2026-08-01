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

export interface CheckPaymentResult {
    externalPaymentId: string;

    status: GatewayPaymentStatus;
}

export interface GatewayWebhookInput {
    headers: Record<
        string,
        string | string[] | undefined
    >;

    body: unknown;

    rawBody?: Buffer;
}

export interface GatewayWebhookResult {
    /**
     * Провайдер мог прислать событие,
     * которое нас не интересует.
     */
    handled: boolean;

    /**
     * Внутренний Payment.id.
     *
     * null — если событие не связано
     * с конкретным платежом.
     */
    paymentId: number | null;

    /**
     * Внешний идентификатор нужен
     * для дополнительной сверки.
     */
    externalPaymentId: string | null;
}

export interface PaymentGateway {
    readonly name: string;

    createPayment(
        input: CreatePaymentInput
    ): Promise<CreatePaymentResult>;

    checkPayment(
        externalPaymentId: string
    ): Promise<CheckPaymentResult>;

    parseWebhook?(
        input: GatewayWebhookInput
    ): Promise<GatewayWebhookResult>;
}