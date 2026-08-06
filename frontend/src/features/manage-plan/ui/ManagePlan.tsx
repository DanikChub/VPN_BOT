import {
    Plus,
} from "lucide-react";

import type {
    CreatePlanPayload,
    Plan,
} from "@/entities/plan";

import {
    Button,
} from "@/shared/ui";

import useManagePlan
    from "../model";

import {
    PlanFormModal,
} from "./PlanFormModal";

import {
    DeletePlanModal,
} from "./DeletePlanModal";


interface ManagePlanProps {
    formPlan:
        | Plan
        | null;

    deletingPlan:
        | Plan
        | null;

    isFormOpen: boolean;

    onOpenCreate: () => void;
    onCloseForm: () => void;
    onCloseDelete: () => void;

    onSuccess: () =>
        | void
        | Promise<void>;
}


export function ManagePlan({
                               formPlan,
                               deletingPlan,
                               isFormOpen,
                               onOpenCreate,
                               onCloseForm,
                               onCloseDelete,
                               onSuccess,
                           }: ManagePlanProps) {
    const {
        status,
        actions,
    } =
        useManagePlan({
            onSuccess,
        });


    const submitPlan = (
        payload: CreatePlanPayload
    ): Promise<boolean> => {
        if (formPlan) {
            return actions.updatePlan(
                formPlan.id,
                payload
            );
        }

        return actions.createPlan(
            payload
        );
    };


    return (
        <>
            <Button
                disabled={
                    status.isLoading
                }
                leftIcon={
                    <Plus className="size-4" />
                }
                onClick={() => {
                    actions.clearError();
                    onOpenCreate();
                }}
            >
                Добавить тариф
            </Button>

            {status.errorMessage && (
                <div
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                >
                    {status.errorMessage}
                </div>
            )}

            <PlanFormModal
                isLoading={
                    status.activeAction ===
                    "create" ||
                    status.activeAction ===
                    "update"
                }
                isOpen={
                    isFormOpen
                }
                onClose={
                    onCloseForm
                }
                onSubmit={
                    submitPlan
                }
                plan={
                    formPlan
                }
            />

            <DeletePlanModal
                isLoading={
                    status.activeAction ===
                    "delete"
                }
                isOpen={
                    deletingPlan !==
                    null
                }
                onClose={
                    onCloseDelete
                }
                onConfirm={
                    actions.deletePlan
                }
                plan={
                    deletingPlan
                }
            />
        </>
    );
}