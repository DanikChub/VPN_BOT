import {
    Link,
} from "lucide-react";


import {
    Page,
    PageContent,
    PageHeader,

} from "@/shared/ui";


import MarketingSourcesList
    from "@/widgets/marketing-sources";

import {
    useRef,
} from "react";

import {
    CreateMarketingSourceDialog,
} from "@/widgets/marketing-sources";


const MarketingSourcesPage = ()=>{


    const refetchSources =
        useRef<
            (()=>Promise<void>) | null
        >(null);


    return (

        <Page>


            <PageHeader

                title="Источники"

                description="Управление рекламными ссылками и каналами привлечения"

                icon={
                    <Link className="size-5"/>
                }


                actions={

                    <CreateMarketingSourceDialog

                        onCreated={()=>{

                            void refetchSources
                                .current
                                ?.();

                        }}

                    />

                }

            />


            <PageContent>


                <MarketingSourcesList

                    onRefetchReady={
                        (refetch)=>{

                            refetchSources.current =
                                refetch;

                        }
                    }

                />


            </PageContent>


        </Page>

    );

};

export default MarketingSourcesPage;