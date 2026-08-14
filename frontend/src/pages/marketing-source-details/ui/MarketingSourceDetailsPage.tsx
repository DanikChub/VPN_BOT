import {
    Link,
} from "lucide-react";


import {
    Page,
    PageContent,
    PageHeader,
} from "@/shared/ui";


import MarketingSourceDetails
    from "@/widgets/marketing-source-details";



const MarketingSourceDetailsPage = ()=>{


    return (

        <Page>


            <PageHeader

                title="Источник"

                description="Пользователи, пришедшие по ссылке"

                icon={
                    <Link className="size-5"/>
                }

            />


            <PageContent>


                <MarketingSourceDetails/>


            </PageContent>


        </Page>

    );

};


export default MarketingSourceDetailsPage;