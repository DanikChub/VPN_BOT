import Plan from "./plan.model";

class PlanService {
    async getActivePlans(): Promise<Plan[]> {
        return Plan.findAll({
            where: {
                is_active: true,
            },
            order: [
                ["duration_days", "ASC"],
            ],
        });
    }
}

export default new PlanService();