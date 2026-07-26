import {
    useEffect,
    useState,
} from "react";

import {
    vpnNodeApi,
    type VpnNode,
} from "@/entities/vpn-node";

import { getApiErrorMessage } from "@/shared/api";

export default function useNodesList() {

    const [nodes, setNodes] =
        useState<VpnNode[]>([]);


    const [isLoading, setIsLoading] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);


    async function loadNodes(): Promise<void> {

        setIsLoading(true);

        setErrorMessage(null);


        try {

            const result =
                await vpnNodeApi.getAll();


            setNodes(result);


        } catch (error: unknown) {
            console.log(error)
            setErrorMessage(
                getApiErrorMessage(error)
            );

        } finally {

            setIsLoading(false);

        }
    }



    useEffect(() => {

        void loadNodes();

    }, []);



    return {
        nodes,

        status: {
            isLoading,
            errorMessage,
        },

        refetch: loadNodes,
    };
}