import {
    Card,
    CardContent,
    EmptyState,
    Spinner,
} from "@/shared/ui";


import {
    Link,
} from "lucide-react";


import type {
    MarketingSource,
} from "@/entities/marketing-source";


import MarketingSourcesTable
    from "./MarketingSourcesTable";



interface Props {

    sources:
        MarketingSource[];

    isLoading:
        boolean;

    errorMessage:
        string | null;

    onOpen:
        (id:number)=>void;

}



const MarketingSourcesListContent = ({
                                         sources,
                                         isLoading,
                                         errorMessage,
                                         onOpen,

                                     }:Props)=>{


    if(errorMessage){

        return (
            <div>
                {errorMessage}
            </div>
        );
    }



    if(isLoading){

        return (
            <Card>

                <CardContent
                    className="flex min-h-72 items-center justify-center"
                >

                    <Spinner size="lg"/>

                </CardContent>

            </Card>
        );
    }



    if(sources.length===0){

        return (

            <EmptyState

                title="Источники не найдены"

                description="Создайте первый рекламный источник"

                icon={
                    <Link className="size-6"/>
                }

            />

        );
    }



    return (

        <MarketingSourcesTable

            sources={sources}

            onOpen={onOpen}

        />

    );

};


export default MarketingSourcesListContent;