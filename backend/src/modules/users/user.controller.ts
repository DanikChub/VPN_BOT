import {
    Request,
    Response,
} from "express";

import userService from "./user.service";

class UserController {
    async registerTelegramUser(
        req: Request,
        res: Response,
    ): Promise<void> {
       const {
           telegramId,
           username,
           firstName
       } = req.body;

        if (!telegramId) {
            res.status(400).json({
                message: "Telegram ID required"
            })

            return;
        }

        const user =
            await userService.findOrCreateTelegramUser({
                telegramId: String(telegramId),
                username: username ?? null,
                firstName: firstName ?? null,
            });

        res.json({
            id: user.id,
            telegramId: user.telegramId,
            username: user.username,
            firstName: user.firstName,
        });
    }
}

export default new UserController();