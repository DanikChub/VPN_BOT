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

}


export default new PaymentService();