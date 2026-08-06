import {
    CreditCard,
} from "lucide-react";

import {
    PlansList,
} from "@/widgets/plans-list";

import {
    Page,
    PageContent,
    PageHeader,
} from "@/shared/ui";


const PlansPage = () => {
    return (
        <Page>
            <PageHeader
                description="Создание, редактирование и управление тарифами подписки"
                icon={
                    <CreditCard className="size-5" />
                }
                title="Тарифы"
            />

            <PageContent>
                <PlansList />
            </PageContent>
        </Page>
    );
};


export default PlansPage;