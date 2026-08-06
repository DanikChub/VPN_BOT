import Plan
    from "../../plans/plan.model";

import type {
    AdminPlanDto,
} from "./admin-plans.types";


export function mapAdminPlan(
    plan: Plan
): AdminPlanDto {
    return {
        id:
        plan.id,

        name:
        plan.name,

        durationDays:
        plan.duration_days,

        priceAmount:
        plan.price_amount,

        currency:
        plan.currency,

        isActive:
        plan.is_active,

        createdAt:
        plan.created_at,

        updatedAt:
        plan.updated_at,
    };
}