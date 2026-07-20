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
    firstName?: string
): Promise<TelegramUserInfo> {
    const response = await backendApi.post(
        "/api/users/telegram",
        {
            telegramId: String(telegramId),
            username: username ?? null,
            firstName: firstName ?? null,
        }
    );

    console.log(response)

    return response.data;
}