import {
    useEffect,
    useState,
} from "react";


import {
    marketingSourceApi,
    type MarketingSource,
} from "@/entities/marketing-source";


import {
    getApiErrorMessage,
} from "@/shared/api";



export default function useMarketingSources() {


    const [
        sources,
        setSources,
    ] = useState<MarketingSource[]>([]);



    const [
        isLoading,
        setIsLoading,
    ] = useState(false);



    const [
        errorMessage,
        setErrorMessage,
    ] = useState<string | null>(null);




    async function loadSources(): Promise<void> {

        setIsLoading(true);

        setErrorMessage(null);


        try {

            const result =
                await marketingSourceApi.getAll();


            setSources(result);


        } catch(error: unknown) {


            setErrorMessage(
                getApiErrorMessage(error)
            );


        } finally {

            setIsLoading(false);

        }
    }



    useEffect(() => {

        void loadSources();

    }, []);



    return {

        sources,

        status:{
            isLoading,
            errorMessage,
        },

        refetch:
        loadSources,

    };
}