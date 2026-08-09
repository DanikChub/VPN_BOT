
import sequelize
    from "../../database/sequelize";

import Payment
    from "./payment.model";


import Order
    from "../orders/order.model";

import subscriptionService
    from "../subscriptions/subscription.service";

import PaymentMethod from "./payment-method.model";
import paymentGatewayRegistry from "./payment-gateway.registry";
import Subscription from "../subscriptions/subscription.model";
import vpnCredentialService from "../vpn/vpn-credential.service";

import {
    PaymentGatewayTemporaryError,
} from "./payment-gateway.interface";

interface ProcessPaymentWebhookInput {
    code: string;

    paymentId: number;

    externalPaymentId: string | null;
}


class PaymentService {

    async create(
        orderId: number,
        paymentMethodId: number
    ) {

        const order =
            await Order.findByPk(
                orderId
            );


        if (!order) {
            throw new Error(
                "Order not found"
            );
        }


        if (order.status !== "pending") {
            throw new Error(
                "Order is not pending"
            );
        }


        const paymentMethod =
            await PaymentMethod.findOne({
                where: {
                    id:
                    paymentMethodId,

                    is_active:
                        true,
                },
            });


        if (!paymentMethod) {
            throw new Error(
                "Active payment method not found"
            );
        }


        const paymentGateway =
            paymentGatewayRegistry.get(
                paymentMethod.code
            );


        const payment =
            await Payment.create({
                order_id:
                order.id,

                payment_method_id:
                paymentMethod.id,

                provider_payment_id:
                    null,

                payment_url:
                    null,

                amount:
                order.amount,

                currency:
                order.currency,

                status:
                    "pending",
            });


        try {

            const invoice =
                await paymentGateway
                    .createPayment({
                        paymentId:
                        payment.id,

                        amount:
                        payment.amount,

                        currency:
                        payment.currency,

                        description:
                            `VPN подписка на ${order.duration_days} дней`,
                    });


            payment.provider_payment_id =
                invoice.externalPaymentId;

            payment.payment_url =
                invoice.paymentUrl;


            await payment.save();


            return {
                paymentId:
                payment.id,

                orderId:
                payment.order_id,

                paymentMethodId:
                payment.payment_method_id,

                paymentUrl:
                payment.payment_url,

                amount:
                payment.amount,

                currency:
                payment.currency,

                status:
                payment.status,
            };

        } catch (error) {

            payment.status =
                "failed";

            await payment.save();

            throw error;
        }
    }

    async check(
        paymentId: number
    ) {

        const payment =
            await Payment.findByPk(
                paymentId
            );

        if (!payment) {
            throw new Error(
                "Payment not found"
            );
        }

        /*
         * Для уже оплаченного платежа
         * повторно провайдера не проверяем.
         */
        if (
            payment.status === "paid"
        ) {
            return this.buildPaidResult(
                payment
            );
        }

        if (
            payment.status === "failed" ||
            payment.status === "cancelled" ||
            payment.status === "expired"
        ) {
            return {
                paymentId:
                payment.id,

                status:
                payment.status,

                paid:
                    false,
            };
        }

        if (
            !payment.provider_payment_id
        ) {
            throw new Error(
                "Provider payment ID is missing"
            );
        }

        /*
         * Определяем, через какой способ
         * был создан конкретный платёж.
         */
        const paymentMethod =
            await PaymentMethod.findByPk(
                payment.payment_method_id
            );

        if (!paymentMethod) {
            throw new Error(
                "Payment method not found"
            );
        }

        /*
         * Получаем нужный gateway:
         *
         * crypto_bot → CryptoPaymentGateway
         * test       → TestPaymentGateway
         * yoo_kassa → YooKassaPaymentGateway
         */
        const paymentGateway =
            paymentGatewayRegistry.get(
                paymentMethod.code
            );

        /*
         * Универсальная проверка.
         * PaymentService не знает,
         * какой именно провайдер вызывается.
         */
        let gatewayResult;

        try {

            gatewayResult =
                await paymentGateway.checkPayment(
                    payment.provider_payment_id
                );

        } catch (error) {

            /*
             * Провайдер временно недоступен.
             *
             * Это НЕ означает:
             * - что платёж провален;
             * - что платёж отменён;
             * - что пользователь не заплатил.
             *
             * Поэтому Payment.status
             * оставляем pending.
             */
            if (
                error instanceof
                PaymentGatewayTemporaryError
            ) {

                console.warn(
                    "[PAYMENT] Payment check temporarily failed",
                    {
                        paymentId:
                        payment.id,

                        paymentMethod:
                        paymentMethod.code,

                        providerPaymentId:
                        payment.provider_payment_id,

                        message:
                        error.message,
                    }
                );


                return {
                    paymentId:
                    payment.id,

                    status:
                        "pending",

                    paid:
                        false,

                    retryable:
                        true,
                };
            }


            throw error;
        }

        if (
            gatewayResult.externalPaymentId !==
            payment.provider_payment_id
        ) {
            throw new Error(
                "Provider payment ID mismatch"
            );
        }

        if (
            gatewayResult.status ===
            "pending"
        ) {
            return {
                paymentId:
                payment.id,

                status:
                    "pending",

                paid:
                    false,
            };
        }

        if (
            gatewayResult.status ===
            "expired"
        ) {
            payment.status =
                "expired";

            await payment.save();

            return {
                paymentId:
                payment.id,

                status:
                payment.status,

                paid:
                    false,
            };
        }

        if (
            gatewayResult.status ===
            "cancelled"
        ) {
            payment.status =
                "cancelled";

            await payment.save();

            return {
                paymentId:
                payment.id,

                status:
                payment.status,

                paid:
                    false,
            };
        }

        if (
            gatewayResult.status ===
            "failed"
        ) {
            payment.status =
                "failed";

            await payment.save();

            return {
                paymentId:
                payment.id,

                status:
                payment.status,

                paid:
                    false,
            };
        }

        if (
            gatewayResult.status !==
            "paid"
        ) {
            throw new Error(
                `Unknown gateway payment status: ${gatewayResult.status}`
            );
        }

        const result =
            await this.confirmPaid(
                payment.id
            );

        const credential =
            await vpnCredentialService.getOrCreate(
                result.userId
            );

        const publicApiUrl =
            process.env.PUBLIC_API_URL;

        if (!publicApiUrl) {
            throw new Error(
                "PUBLIC_API_URL is not defined"
            );
        }

        return {
            paymentId:
            payment.id,

            status:
                "paid",

            paid:
                true,

            expiresAt:
            result.expiresAt,

            subscriptionUrl:
                `${publicApiUrl}/sub/${credential.subscription_token}`,
        };
    }


    private async confirmPaid(
        paymentId: number
    ): Promise<{
        userId: number;
        expiresAt: Date;
    }> {

        return sequelize.transaction(
            async (transaction) => {

                const payment =
                    await Payment.findByPk(
                        paymentId,
                        {
                            transaction,
                            lock:
                            transaction.LOCK.UPDATE,
                        }
                    );


                if (!payment) {
                    throw new Error(
                        "Payment not found"
                    );
                }


                const order =
                    await Order.findByPk(
                        payment.order_id,
                        {
                            transaction,
                            lock:
                            transaction.LOCK.UPDATE,
                        }
                    );


                if (!order) {
                    throw new Error(
                        "Order not found"
                    );
                }


                /*
                 * Платёж уже обработан.
                 * Повторно подписку не продлеваем.
                 */
                if (payment.status === "paid") {

                    const subscription =
                        await Subscription.findOne({
                            where: {
                                user_id:
                                order.user_id,
                            },
                            transaction,
                        });


                    if (!subscription) {
                        throw new Error(
                            "Subscription not found for paid payment"
                        );
                    }


                    return {
                        userId:
                        order.user_id,

                        expiresAt:
                        subscription.expires_at,
                    };
                }


                payment.status =
                    "paid";


                await payment.save({
                    transaction,
                });


                order.status =
                    "paid";


                await order.save({
                    transaction,
                });


                const subscription =
                    await subscriptionService.extend(
                        order.user_id,
                        order.duration_days,
                        transaction
                    );


                return {
                    userId:
                    order.user_id,

                    expiresAt:
                    subscription.expires_at,
                };
            }
        );
    }

    private async buildPaidResult(
        payment: Payment
    ) {
        const order =
            await Order.findByPk(
                payment.order_id
            );

        if (!order) {
            throw new Error(
                "Order not found"
            );
        }

        const subscription =
            await Subscription.findOne({
                where: {
                    user_id:
                    order.user_id,
                },
            });

        if (!subscription) {
            throw new Error(
                "Subscription not found"
            );
        }

        const credential =
            await vpnCredentialService.getOrCreate(
                order.user_id
            );

        const publicApiUrl =
            process.env.PUBLIC_API_URL;

        if (!publicApiUrl) {
            throw new Error(
                "PUBLIC_API_URL is not defined"
            );
        }

        return {
            paymentId:
            payment.id,

            status:
                "paid",

            paid:
                true,

            expiresAt:
            subscription.expires_at,

            subscriptionUrl:
                `${publicApiUrl}/sub/${credential.subscription_token}`,
        };
    }

    async processWebhook(
        input: ProcessPaymentWebhookInput
    ) {
        const payment =
            await Payment.findByPk(
                input.paymentId,
            );

        if (!payment) {
            throw new Error(
                `Payment ${input.paymentId} not found`
            );
        }

        const paymentMethod =  await PaymentMethod.findByPk(
            payment?.payment_method_id
        )

        if (!paymentMethod) {
            throw new Error(
                "Payment method is missing"
            );
        }


        /*
         * Не позволяем событию Crypto Pay
         * подтвердить платёж другого gateway.
         */
        if (
            paymentMethod.code !==
            input.code
        ) {
            throw new Error(
                "Webhook gateway does not match payment gateway"
            );
        }


        /*
         * Проверяем, что provider invoice
         * совпадает с сохранённым.
         */
        if (
            input.externalPaymentId &&
            payment.provider_payment_id !==
            input.externalPaymentId
        ) {
            throw new Error(
                "Webhook external payment ID mismatch"
            );
        }


        /*
         * Ключевой момент:
         *
         * webhook только инициирует проверку.
         * Окончательное подтверждение делает
         * стандартный check().
         */
        return this.check(
            input.paymentId
        );
    }
}


export default new PaymentService();