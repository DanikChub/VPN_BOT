import Plan
    from "../../plans/plan.model";

import Order
    from "../../orders/order.model";

import {
    mapAdminPlan,
} from "./admin-plans.mapper";

import type {
    AdminPlanDto,
    CreateAdminPlanInput,
    UpdateAdminPlanInput,
} from "./admin-plans.types";


class AdminPlansService {
    async getAll(): Promise<
        AdminPlanDto[]
    > {
        const plans =
            await Plan.findAll({
                order: [
                    [
                        "is_active",
                        "DESC",
                    ],

                    [
                        "duration_days",
                        "ASC",
                    ],

                    [
                        "id",
                        "ASC",
                    ],
                ],
            });

        return plans.map(
            mapAdminPlan
        );
    }


    async getById(
        planId: number
    ): Promise<AdminPlanDto> {
        const plan =
            await this.findPlanOrThrow(
                planId
            );

        return mapAdminPlan(
            plan
        );
    }


    async create(
        input: CreateAdminPlanInput
    ): Promise<AdminPlanDto> {
        const plan =
            await Plan.create({
                name:
                input.name,

                duration_days:
                input.durationDays,

                price_amount:
                input.priceAmount,

                currency:
                input.currency,

                is_active:
                input.isActive,
            });

        return mapAdminPlan(
            plan
        );
    }


    async update(
        planId: number,
        input: UpdateAdminPlanInput
    ): Promise<AdminPlanDto> {
        const plan =
            await this.findPlanOrThrow(
                planId
            );

        if (input.name !== undefined) {
            plan.name =
                input.name;
        }

        if (
            input.durationDays !==
            undefined
        ) {
            plan.duration_days =
                input.durationDays;
        }

        if (
            input.priceAmount !==
            undefined
        ) {
            plan.price_amount =
                input.priceAmount;
        }

        if (
            input.currency !==
            undefined
        ) {
            plan.currency =
                input.currency;
        }

        if (
            input.isActive !==
            undefined
        ) {
            plan.is_active =
                input.isActive;
        }

        await plan.save();

        return mapAdminPlan(
            plan
        );
    }


    async delete(
        planId: number
    ): Promise<void> {
        const plan =
            await this.findPlanOrThrow(
                planId
            );

        const ordersCount =
            await Order.count({
                where: {
                    plan_id:
                    planId,
                },
            });

        if (ordersCount > 0) {
            throw new Error(
                "Plan cannot be deleted because it is used by existing orders. Deactivate it instead."
            );
        }

        await plan.destroy();
    }


    private async findPlanOrThrow(
        planId: number
    ): Promise<Plan> {
        const plan =
            await Plan.findByPk(
                planId
            );

        if (!plan) {
            throw new Error(
                "Plan not found"
            );
        }

        return plan;
    }
}


export default new AdminPlansService();