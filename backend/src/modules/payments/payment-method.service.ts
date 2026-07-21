import PaymentMethod from "./payment-method.model";

class PaymentMethodService {
    async getActive(): Promise<PaymentMethod[]> {
        return PaymentMethod.findAll({
            where: {
                is_active: true,
            },
            order: [
                ["sort_order", "ASC"],
                ["id", "ASC"],
            ],
        });
    }
}

export default new PaymentMethodService();