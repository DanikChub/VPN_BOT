export const marketingSourceTypes = [
    "telegram",
    "tiktok",
    "blogger",
    "friend",
    "other",
] as const;


export type MarketingSourceType =
    typeof marketingSourceTypes[number];


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


export interface GetMarketingSourcesQuery {
    is_active?: boolean;

    type?: MarketingSourceType;

    search?: string;
}