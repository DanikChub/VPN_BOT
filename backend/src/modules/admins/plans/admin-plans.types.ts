export interface AdminPlanDto {
    id: number;

    name: string;
    durationDays: number;

    priceAmount: number;
    currency: string;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}




export interface CreateAdminPlanInput {
    name: string;
    durationDays: number;

    priceAmount: number;
    currency: string;

    isActive: boolean;
}


export interface UpdateAdminPlanInput {
    name?: string;
    durationDays?: number;

    priceAmount?: number;
    currency?: string;

    isActive?: boolean;
}