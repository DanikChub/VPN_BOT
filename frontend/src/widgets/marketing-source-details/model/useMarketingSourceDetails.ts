import {
    useEffect,
    useState,
} from "react";


import {
    marketingSourceApi,

    type MarketingSourceUsersResponse,

} from "@/entities/marketing-source";


import {
    getApiErrorMessage,
} from "@/shared/api";



export default function useMarketingSourceDetails(
    id:number
) {


    const [
        data,
        setData,
    ] =
        useState<
            MarketingSourceUsersResponse | null
        >(null);



    const [
        isLoading,
        setIsLoading,
    ] =
        useState(false);



    const [
        errorMessage,
        setErrorMessage,
    ] =
        useState<string|null>(null);




    async function load():Promise<void>{


        setIsLoading(true);

        setErrorMessage(null);



        try {


            const result =
                await marketingSourceApi.getUsers(
                    id
                );


            setData(result);



        }catch(error:unknown){


            setErrorMessage(
                getApiErrorMessage(error)
            );


        }finally{


            setIsLoading(false);

        }

    }



    useEffect(()=>{

        void load();

    },[id]);



    return {

        data,

        status:{
            isLoading,
            errorMessage,
        },


        refetch:
        load,

    };

}