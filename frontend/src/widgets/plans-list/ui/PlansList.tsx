import {
    useState,
} from "react";

import {
    type Plan,
} from "@/entities/plan";

import {
    ManagePlan,
} from "@/features/manage-plan";

import usePlansList
    from "../model";

import PlansListContent
    from "./PlansListContent";


export function PlansList() {
    const [
        formPlan,
        setFormPlan,
    ] =
        useState<Plan | null>(
            null
        );

    const [
        deletingPlan,
        setDeletingPlan,
    ] =
        useState<Plan | null>(
            null
        );

    const [
        isFormOpen,
        setIsFormOpen,
    ] =
        useState(false);

    const {
        plans,
        status,
        actions,
    } =
        usePlansList();


    const openCreate = (): void => {
        setFormPlan(null);
        setIsFormOpen(true);
    };


    const openEdit = (
        plan: Plan
    ): void => {
        setFormPlan(plan);
        setIsFormOpen(true);
    };


    const closeForm = (): void => {
        setIsFormOpen(false);
        setFormPlan(null);
    };


    return (
        <div className="space-y-5">
            <div className="flex justify-end">
                <ManagePlan
                    deletingPlan={
                        deletingPlan
                    }
                    formPlan={
                        formPlan
                    }
                    isFormOpen={
                        isFormOpen
                    }
                    onCloseDelete={() => {
                        setDeletingPlan(
                            null
                        );
                    }}
                    onCloseForm={
                        closeForm
                    }
                    onOpenCreate={
                        openCreate
                    }
                    onSuccess={
                        actions.reload
                    }
                />
            </div>

            <PlansListContent
                errorMessage={
                    status.errorMessage
                }
                isLoading={
                    status.isLoading
                }
                isMutating={false}
                onDelete={
                    setDeletingPlan
                }
                onEdit={
                    openEdit
                }
                plans={
                    plans
                }
            />
        </div>
    );
}