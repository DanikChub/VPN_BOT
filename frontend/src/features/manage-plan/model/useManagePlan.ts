import {
    useState,
} from "react";

import {
    planApi,
    type CreatePlanPayload,
    type UpdatePlanPayload,
} from "@/entities/plan";

import {
    getApiErrorMessage,
} from "@/shared/api";


export type ManagePlanAction =
    | "create"
    | "update"
    | "delete";


interface UseManagePlanOptions {
    onSuccess: () =>
        | void
        | Promise<void>;
}


const useManagePlan = ({
                           onSuccess,
                       }: UseManagePlanOptions) => {
    const [
        activeAction,
        setActiveAction,
    ] =
        useState<ManagePlanAction | null>(
            null
        );

    const [
        errorMessage,
        setErrorMessage,
    ] =
        useState<string | null>(
            null
        );


    const executeAction = async (
        action: ManagePlanAction,
        callback: () => Promise<unknown>
    ): Promise<boolean> => {
        setActiveAction(action);
        setErrorMessage(null);

        try {
            await callback();
            await onSuccess();

            return true;
        } catch (error: unknown) {
            setErrorMessage(
                getApiErrorMessage(
                    error
                )
            );

            return false;
        } finally {
            setActiveAction(null);
        }
    };


    const createPlan = (
        payload: CreatePlanPayload
    ): Promise<boolean> => {
        return executeAction(
            "create",
            () =>
                planApi.create(
                    payload
                )
        );
    };


    const updatePlan = (
        planId: number,
        payload: UpdatePlanPayload
    ): Promise<boolean> => {
        return executeAction(
            "update",
            () =>
                planApi.update(
                    planId,
                    payload
                )
        );
    };


    const deletePlan = (
        planId: number
    ): Promise<boolean> => {
        return executeAction(
            "delete",
            () =>
                planApi.deleteById(
                    planId
                )
        );
    };


    return {
        status: {
            activeAction,
            errorMessage,

            isLoading:
                activeAction !== null,
        },

        actions: {
            createPlan,
            updatePlan,
            deletePlan,

            clearError: () => {
                setErrorMessage(null);
            },
        },
    };
};


export default useManagePlan;