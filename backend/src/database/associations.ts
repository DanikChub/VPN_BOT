import User from "../modules/users/user.model";
import Subscription from "../modules/subscriptions/subscription.model";
import VpnCredential from "../modules/vpn/vpn-credential.model";
import Order from "../modules/orders/order.model";
import Plan from "../modules/plans/plan.model";
import Payment from "../modules/payments/payment.model";
import BalanceTransaction from "../modules/balances/balance-transaction.model";
import PaymentMethod from "../modules/payments/payment-method.model";

export const initAssociations = (): void => {
    User.hasOne(Subscription, {
        foreignKey: "user_id",
        as: "subscription",
        onDelete: "CASCADE",
    });

    Subscription.belongsTo(User, {
        foreignKey: "user_id",
        as: "user",
    });

    User.hasOne(VpnCredential, {
        foreignKey: "user_id",
        as: "vpnCredential",
        onDelete: "CASCADE",
    });

    VpnCredential.belongsTo(User, {
        foreignKey: "user_id",
        as: "user",
    });

    User.hasMany(Order, {
        foreignKey: "user_id",
    });

    Order.belongsTo(User, {
        foreignKey: "user_id",
    });


    Plan.hasMany(Order, {
        foreignKey: "plan_id",
    });

    Order.belongsTo(Plan, {
        foreignKey: "plan_id",
    });


    Order.hasMany(Payment, {
        foreignKey: "order_id",
    });

    Payment.belongsTo(Order, {
        foreignKey: "order_id",
    });

    User.hasMany(BalanceTransaction, {
        foreignKey: "user_id",
        as: "balance_transactions",
    });

    BalanceTransaction.belongsTo(User, {
        foreignKey: "user_id",
        as: "user",
    });

    Payment.belongsTo(PaymentMethod, {
        foreignKey: "payment_method_id",
        as: "payment_method",
    });

    PaymentMethod.hasMany(Payment, {
        foreignKey: "payment_method_id",
        as: "payments",
    });
};