import {
    useNavigate,
} from "react-router-dom";


import useMarketingSources
    from "../model/useMarketingSources";


import MarketingSourcesListContent
    from "./MarketingSourcesListContent";
import {useEffect} from "react";


interface Props {

    onRefetchReady?:
        (
            refetch:()=>Promise<void>
        )=>void;

}



const MarketingSourcesList = ({
                                  onRefetchReady,

                              }:Props)=>{


    const navigate =
        useNavigate();



    const {
        sources,
        status,
        refetch,

    } =
        useMarketingSources();



    useEffect(()=>{

        onRefetchReady?.(
            refetch
        );

    },[]);


    return (

        <MarketingSourcesListContent

            sources={sources}

            isLoading={
                status.isLoading
            }

            errorMessage={
                status.errorMessage
            }

            onOpen={(id)=>{

                navigate(
                    `/marketing-sources/${id}`
                );

            }}

        />

    );

};


export default MarketingSourcesList;