import Payment from "./payment.model";
import Order from "../orders/order.model";
import Plan from "../plans/plan.model";

import subscriptionService
    from "../subscriptions/subscription.service";
import cryptoPaymentGateway from "./gateways/crypto-payment.gateway";


class PaymentService {


    async create(
        orderId:number
    ) {

        const order =
            await Order.findByPk(orderId);


        if(!order){
            throw new Error(
                "Order not found"
            );
        }


        const payment =
            await Payment.create({

                order_id:order.id,

                provider:"crypto_bot",

                amount:
                order.amount,

                currency:
                order.currency,

                status:"pending"

            });

        const invoice =
            await cryptoPaymentGateway.createPayment({

                paymentId:
                payment.id,

                amount:
                payment.amount,

                currency:
                payment.currency,

                description:
                    "VPN подписка"

            });


        payment.provider_payment_id =
            invoice.externalPaymentId;


        await payment.save();


        return {
            payment,
            paymentUrl:
            invoice.paymentUrl
        };
    }



    async markSuccessful(
        paymentId:number
    ) {


        const payment =
            await Payment.findByPk(
                paymentId
            );


        if(!payment){
            throw new Error(
                "Payment not found"
            );
        }

        if (payment.status === "successful") {
            return;
        }


        const order =
            await Order.findByPk(
                payment.order_id
            );


        if(!order){
            throw new Error(
                "Order not found"
            );
        }



        const plan =
            await Plan.findByPk(
                order.plan_id
            );


        if(!plan){
            throw new Error(
                "Plan not found"
            );
        }



        payment.status="successful";

        await payment.save();



        order.status="paid";

        await order.save();



        await subscriptionService.extend(
            order.user_id,
            plan.duration_days
        );
    }

    async getStatus(
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

        return payment;
    }

    async checkAndConfirm(
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


        if (
            payment.status ===
            "successful"
        ) {
            return payment;
        }


        if (
            !payment.provider_payment_id
        ) {
            throw new Error(
                "Provider payment ID is missing"
            );
        }


        const invoice =
            await cryptoPaymentGateway.getInvoice(
                payment.provider_payment_id
            );


        if (!invoice) {
            throw new Error(
                "Crypto Pay invoice not found"
            );
        }


        if (
            invoice.status !== "paid"
        ) {
            return payment;
        }


        await this.markSuccessful(
            payment.id
        );


        await payment.reload();

        return payment;
    }

}


export default new PaymentService();