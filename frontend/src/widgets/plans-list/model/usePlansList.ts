import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    planApi,
    type Plan,
} from "@/entities/plan";

import {
    getApiErrorMessage,
} from "@/shared/api";


const usePlansList = () => {
    const [
        plans,
        setPlans,
    ] =
        useState<Plan[]>([]);

    const [
        isLoading,
        setIsLoading,
    ] =
        useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] =
        useState<string | null>(
            null
        );


    const loadPlans =
        useCallback(
            async (): Promise<void> => {
                setIsLoading(true);
                setErrorMessage(null);

                try {
                    const response =
                        await planApi.getAll();
                    console.log(response)
                    setPlans(
                        response.plans
                    );
                } catch (error: unknown) {
                    setErrorMessage(
                        getApiErrorMessage(
                            error
                        )
                    );
                } finally {
                    setIsLoading(false);
                }
            },
            []
        );


    useEffect(() => {
        void loadPlans();
    }, [
        loadPlans,
    ]);


    return {
        plans,

        status: {
            isLoading,
            errorMessage,
        },

        actions: {
            reload:
            loadPlans,
        },
    };
};


export default usePlansList;