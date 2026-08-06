import {
    CreditCard,
} from "lucide-react";

import {
    PlansTable,
    type Plan,
} from "@/entities/plan";

import {
    Card,
    CardContent,
    EmptyState,
    Spinner,
} from "@/shared/ui";


interface PlansListContentProps {
    plans: Plan[];

    isLoading: boolean;
    isMutating: boolean;

    errorMessage:
        | string
        | null;

    onEdit: (
        plan: Plan
    ) => void;

    onDelete: (
        plan: Plan
    ) => void;
}


const PlansListContent = ({
                              plans,
                              isLoading,
                              isMutating,
                              errorMessage,
                              onEdit,
                              onDelete,
                          }: PlansListContentProps) => {
    if (errorMessage) {
        return (
            <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {errorMessage}
            </div>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex min-h-72 items-center justify-center">
                    <Spinner size="lg" />
                </CardContent>
            </Card>
        );
    }

    if (plans.length === 0) {
        return (
            <EmptyState
                description="Создайте первый тариф, чтобы пользователи могли покупать подписку."
                icon={
                    <CreditCard className="size-6" />
                }
                title="Тарифов пока нет"
            />
        );
    }

    return (
        <PlansTable
            isMutating={isMutating}
            onDelete={onDelete}
            onEdit={onEdit}
            plans={plans}
        />
    );
};


export default PlansListContent;