import backendApi from "../../api/backend.api";

export interface TelegramUserInfo {
    id: number;
    telegramId: string;

    username: string | null;
    firstName: string | null;

    balanceAmount: number;

    subscriptionActiveUntil: string | null;

    connectionUrl?: string | null;
}

export async function getTelegramUserInfo(
    telegramId: number,
    username?: string,
    firstName?: string,
    startPayload?: string,
) {

    const response =
        await backendApi.post(
            "/api/users/register",
            {
                telegramId,

                username,

                firstName,

                startPayload,
            }
        );


    return response.data;
}