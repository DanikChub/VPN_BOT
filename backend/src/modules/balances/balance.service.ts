import {
    Transaction,
} from "sequelize";


import User from "../users/user.model";
import BalanceTransaction, {
    BalanceTransactionType,
} from "./balance-transaction.model";
import sequelize from "../../database/sequelize";

interface ChangeBalanceParams {
    userId: number;
    amount: number;
    type: BalanceTransactionType;
    description?: string | null;
    idempotencyKey: string;
}

class BalanceService {
    async getBalance(userId: number) {
        const user = await User.findByPk(userId, {
            attributes: [
                "id",
                "balance_amount",
            ],
        });

        if (!user) {
            throw new Error("Пользователь не найден");
        }

        return {
            amount: Number(user.balance_amount),
            currency: "RUB",
        };
    }

    async changeBalance(
        params: ChangeBalanceParams,
        externalTransaction?: Transaction
    ) {
        if (params.amount === 0) {
            throw new Error(
                "Сумма операции не может быть равна нулю"
            );
        }

        if (externalTransaction) {
            return this.changeBalanceInsideTransaction(
                params,
                externalTransaction
            );
        }

        return sequelize.transaction(async transaction => {
            return this.changeBalanceInsideTransaction(
                params,
                transaction
            );
        });
    }

    async addWelcomeBonus(
        userId: number,
        transaction?: Transaction
    ) {
        return this.changeBalance(
            {
                userId,
                amount: 15_000,
                type: "bonus",
                description:
                    "Приветственный бонус — 150 рублей",
                idempotencyKey:
                    `welcome-bonus:${userId}`,
            },
            transaction
        );
    }

    async depositFromPayment(params: {
        userId: number;
        paymentId: number;
        amount: number;
        transaction?: Transaction;
    }) {
        return this.changeBalance(
            {
                userId: params.userId,
                amount: params.amount,
                type: "deposit",
                description: "Пополнение баланса",
                idempotencyKey:
                    `payment:${params.paymentId}`,
            },
            params.transaction
        );
    }

    async chargeSubscription(params: {
        userId: number;
        subscriptionId: number;
        amount: number;
        chargeDate: string;
        transaction?: Transaction;
    }) {
        if (params.amount <= 0) {
            throw new Error(
                "Сумма списания должна быть больше нуля"
            );
        }

        return this.changeBalance(
            {
                userId: params.userId,
                amount: -params.amount,
                type: "subscription_charge",
                description:
                    "Списание за использование VPN",
                idempotencyKey:
                    [
                        "subscription-charge",
                        params.subscriptionId,
                        params.chargeDate,
                    ].join(":"),
            },
            params.transaction
        );
    }

    private async changeBalanceInsideTransaction(
        params: ChangeBalanceParams,
        transaction: Transaction
    ) {
        const existingOperation =
            await BalanceTransaction.findOne({
                where: {
                    idempotency_key:
                    params.idempotencyKey,
                },
                transaction,
            });

        if (existingOperation) {
            return {
                transaction: existingOperation,
                alreadyProcessed: true,
            };
        }

        const user = await User.findByPk(
            params.userId,
            {
                transaction,
                lock: transaction.LOCK.UPDATE,
            }
        );

        if (!user) {
            throw new Error("Пользователь не найден");
        }

        const currentBalance =
            Number(user.balance_amount);

        const newBalance =
            currentBalance + params.amount;

        if (newBalance < 0) {
            throw new Error(
                "Недостаточно средств на балансе"
            );
        }

        user.balance_amount = newBalance;

        await user.save({
            transaction,
        });

        const balanceTransaction =
            await BalanceTransaction.create(
                {
                    user_id: user.id,
                    amount: params.amount,
                    type: params.type,
                    description:
                        params.description ?? null,
                    idempotency_key:
                    params.idempotencyKey,
                },
                {
                    transaction,
                }
            );

        return {
            transaction: balanceTransaction,
            alreadyProcessed: false,
            balance: newBalance,
        };
    }
}

export default new BalanceService();