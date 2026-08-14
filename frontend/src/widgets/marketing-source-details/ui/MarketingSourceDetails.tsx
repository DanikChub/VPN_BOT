import {
    useParams,
} from "react-router-dom";


import useMarketingSourceDetails
    from "../model/useMarketingSourceDetails";


import MarketingSourceDetailsContent
    from "./MarketingSourceDetailsContent";



const MarketingSourceDetails = ()=>{


    const {
        id,
    } =
        useParams();



    const sourceId =
        Number(id);



    const {
        data,
        status,

    } =
        useMarketingSourceDetails(
            sourceId
        );



    return (

        <MarketingSourceDetailsContent

            data={data}

            isLoading={
                status.isLoading
            }

            errorMessage={
                status.errorMessage
            }

        />

    );

};


export default MarketingSourceDetails;