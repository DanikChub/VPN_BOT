export function formatMoney(
    amount: number
): string {
    return new Intl.NumberFormat(
        "ru-RU",
        {
            style: "currency",
            currency: "RUB",
        }
    ).format(amount / 100);
}