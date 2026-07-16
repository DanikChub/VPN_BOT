import User from "./user.model";


interface FindOrCrateTelegramUserPayload {
    telegramId: string;
    username: string | null;
    firstName: string | null;
}

class UserService {
    async findOrCreateTelegramUser(
        payload: FindOrCrateTelegramUserPayload,
    ) {
        const [user] = await User.findOrCreate({
            where: {
                telegramId: payload.telegramId,
            },

            defaults: {
                telegramId: payload.telegramId,
                username: payload.username,
                firstName: payload.firstName,
            }
        });

        return user;
    }
}

export default new UserService();