export interface Plan {
    id: number;

    name: string;
    durationDays: number;

    /**
     * Цена в минимальных единицах валюты.
     *
     * Для RUB:
     * 29900 = 299 рублей.
     */
    priceAmount: number;

    currency: string;

    isActive: boolean;

    createdAt: string;
    updatedAt: string;
}


export interface GetPlansResponse {
    plans: Plan[];
}


export interface GetPlanByIdResponse {
    plan: Plan;
}


export interface CreatePlanPayload {
    name: string;
    durationDays: number;

    priceAmount: number;
    currency: string;

    isActive: boolean;
}


export interface CreatePlanResponse {
    plan: Plan;
}


export interface UpdatePlanPayload {
    name?: string;
    durationDays?: number;

    priceAmount?: number;
    currency?: string;

    isActive?: boolean;
}


export interface UpdatePlanResponse {
    plan: Plan;
}