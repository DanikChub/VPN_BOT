import type {UserSubscriptionFilter} from "@/entities/user";
import {Card, CardContent, Input} from "@/shared/ui";
import {Search} from "lucide-react";

interface UsersFiltersProps {
    search: string;
    subscriptionStatus: UserSubscriptionFilter;

    onSearchChange: (value: string) => void;

    onSubscriptionStatusChange: (
        value: UserSubscriptionFilter
    ) => void;
}

const UsersFilter = ({
                         search,
                         subscriptionStatus,
                         onSearchChange,
                         onSubscriptionStatusChange
                     }: UsersFiltersProps) => {
    return (
        <Card>
            <CardContent>
                <div className="flex flex-col gap-4 lg:flex-row">
                    <Input
                        containerClassName="flex-1"
                        leftIcon={
                            <Search className="size-5" />
                        }
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Имя, username или Telegram ID"
                        value={search}
                    />

                    <select
                        className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm"
                        onChange={(event) => {
                            onSubscriptionStatusChange(
                                event.target.value as
                                    UserSubscriptionFilter
                            );
                        }}
                        value={subscriptionStatus}
                    >
                        <option value="all">
                            Все подписки
                        </option>

                        <option value="active">
                            Активные
                        </option>

                        <option value="expired">
                            Истёкшие
                        </option>

                        <option value="blocked">
                            Заблокированные
                        </option>

                        <option value="none">
                            Без подписки
                        </option>
                    </select>
                </div>
            </CardContent>
        </Card>
    )
}

export default UsersFilter;