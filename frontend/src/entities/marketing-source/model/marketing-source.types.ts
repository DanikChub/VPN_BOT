export type MarketingSourceType =
    | "telegram"
    | "tiktok"
    | "blogger"
    | "friend"
    | "other";


export interface MarketingSource {

    id: number;

    name: string;

    code: string;

    type: MarketingSourceType;

    is_active: boolean;


    telegram_link: string;

    users_count?: number;


    created_at: string;

    updated_at: string;
}


export interface CreateMarketingSourceDto {

    name: string;

    code: string;

    type: MarketingSourceType;
}


export interface UpdateMarketingSourceDto {

    name?: string;

    code?: string;

    type?: MarketingSourceType;

    is_active?: boolean;
}


export interface MarketingSourceUser {

    id: number;

    telegramId: string;

    username: string | null;

    firstName: string | null;

    createdAt: string;
}


export interface MarketingSourceUsersResponse {

    source: {
        id: number;

        name: string;

        code: string;

        type: MarketingSourceType;
    };


    users: MarketingSourceUser[];
}