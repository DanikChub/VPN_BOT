import {
    useState,
} from "react";

import {
    userApi,
} from "@/entities/user";

import {
    getApiErrorMessage,
} from "@/shared/api";


export type SubscriptionAction =
    | "extend"
    | "expire"
    | "block"
    | "unblock";


interface UseManageUserSubscriptionOptions {
    userId: number;

    onSuccess: () =>
        | void
        | Promise<void>;
}


const useManageUserSubscription = ({
                                       userId,
                                       onSuccess,
                                   }: UseManageUserSubscriptionOptions) => {
    const [
        activeAction,
        setActiveAction,
    ] =
        useState<SubscriptionAction | null>(
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
        action: SubscriptionAction,
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


    const extendSubscription = (
        durationDays: number
    ): Promise<boolean> => {
        return executeAction(
            "extend",
            () =>
                userApi.extendSubscription(
                    userId,
                    {
                        durationDays,
                    }
                )
        );
    };


    const expireSubscription =
        (): Promise<boolean> => {
            return executeAction(
                "expire",
                () =>
                    userApi.expireSubscription(
                        userId
                    )
            );
        };


    const blockSubscription =
        (): Promise<boolean> => {
            return executeAction(
                "block",
                () =>
                    userApi.blockSubscription(
                        userId
                    )
            );
        };


    const unblockSubscription =
        (): Promise<boolean> => {
            return executeAction(
                "unblock",
                () =>
                    userApi.unblockSubscription(
                        userId
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
            extendSubscription,
            expireSubscription,
            blockSubscription,
            unblockSubscription,

            clearError: () => {
                setErrorMessage(null);
            },
        },
    };
};


export default useManageUserSubscription;