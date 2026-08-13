import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    type VpnNode,
    vpnNodeApi,
} from "@/entities/vpn-node";

import {
    getApiErrorMessage,
} from "@/shared/api";


interface UseNodeDetailsResult {
    node:
        | VpnNode
        | null;

    status: {
        isLoading: boolean;

        errorMessage:
            | string
            | null;
    };

    actions: {
        reload: () =>
            Promise<void>;
    };
}


const useNodeDetails = (
    nodeId: number,
): UseNodeDetailsResult => {
    const [
        node,
        setNode,
    ] =
        useState<VpnNode | null>(
            null,
        );

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
            null,
        );


    const loadNode =
        useCallback(
            async (): Promise<void> => {
                setIsLoading(true);

                setErrorMessage(
                    null,
                );

                try {
                    const response =
                        await vpnNodeApi
                            .getDetails(
                                nodeId,
                            );

                    setNode(
                        response,
                    );
                } catch (
                    error: unknown
                    ) {
                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                        ),
                    );
                } finally {
                    setIsLoading(
                        false,
                    );
                }
            },
            [
                nodeId,
            ],
        );


    useEffect(() => {
        void loadNode();
    }, [
        loadNode,
    ]);


    return {
        node,

        status: {
            isLoading,
            errorMessage,
        },

        actions: {
            reload:
            loadNode,
        },
    };
};


export default useNodeDetails;