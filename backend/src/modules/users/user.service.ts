import User from "./user.model";
import balanceService from "../balances/balance.service";


interface FindOrCrateTelegramUserPayload {
    telegramId: string;
    username: string | null;
    firstName: string | null;

}

class UserService {
    async findOrCreateTelegramUser(
        payload: FindOrCrateTelegramUserPayload,
    ) {
        const [user, created] = await User.findOrCreate({
            where: {
                telegramId: payload.telegramId,
            },

            defaults: {
                telegramId: payload.telegramId,
                username: payload.username,
                firstName: payload.firstName,
            }
        });

        if (created) {
            await balanceService.addWelcomeBonus(
                user.id
            );

        }

        return user;
    }
}

export default new UserService();