import User from "../modules/users/user.model";
import Subscription from "../modules/subscriptions/subscription.model";
import VpnCredential from "../modules/vpn/vpn-credential.model";
import Order from "../modules/orders/order.model";
import Plan from "../modules/plans/plan.model";
import Payment from "../modules/payments/payment.model";

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
};