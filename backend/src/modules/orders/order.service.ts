import Plan from "../plans/plan.model";
import Order from "./order.model";

class OrderService {
    async create(
        userId: number,
        planId: number
    ): Promise<Order> {
        const plan = await Plan.findOne({
            where: {
                id: planId,
                is_active: true,
            },
        });

        if (!plan) {
            throw new Error(
                "Active plan not found"
            );
        }

        return Order.create({
            user_id: userId,
            plan_id: plan.id,

            amount: plan.price_amount,
            currency: plan.currency,

            status: "pending",
        });
    }
}

export default new OrderService();