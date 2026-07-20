import {
    NextFunction,
    Request,
    Response,
} from "express";

import User from "../users/user.model";
import balanceService from "./balance.service";

class BalanceController {
    async getByTelegramId(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const telegramId =
                String(req.params.telegramId);

            const user = await User.findOne({
                where: {
                    telegramId: telegramId,
                },
            });

            if (!user) {
                return res.status(404).json({
                    message: "Пользователь не найден",
                });
            }

            const balance =
                await balanceService.getBalance(user.id);

            return res.json({
                userId: user.id,
                balanceAmount: balance.amount,
                currency: balance.currency,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new BalanceController();