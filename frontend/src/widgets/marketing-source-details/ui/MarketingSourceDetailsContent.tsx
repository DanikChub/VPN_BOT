import {
    Card,
    CardContent,
    Spinner,
    EmptyState,
} from "@/shared/ui";


import {
    Link,
} from "lucide-react";


import type {
    MarketingSourceUsersResponse,
} from "@/entities/marketing-source";


import MarketingSourceUsersTable
    from "./MarketingSourceUsersTable";



interface Props {

    data:
        MarketingSourceUsersResponse | null;

    isLoading:
        boolean;

    errorMessage:
        string | null;

}



const MarketingSourceDetailsContent = ({
                                           data,
                                           isLoading,
                                           errorMessage,

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
                    className="
                    flex
                    min-h-72
                    items-center
                    justify-center
                    "
                >

                    <Spinner size="lg"/>

                </CardContent>

            </Card>

        );

    }



    if(!data){

        return (

            <EmptyState

                title="Источник не найден"

                icon={
                    <Link className="size-6"/>
                }

                description=""
            />

        );

    }



    return (

        <div className="space-y-6">


            <Card>

                <CardContent
                    className="space-y-3"
                >

                    <div>

                        <p className="text-sm text-muted-foreground">
                            Название
                        </p>

                        <p className="font-medium">
                            {
                                data.source.name
                            }
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-muted-foreground">
                            Код
                        </p>

                        <p>
                            {
                                data.source.code
                            }
                        </p>

                    </div>



                    <div>

                        <p className="text-sm text-muted-foreground">
                            Тип
                        </p>

                        <p>
                            {
                                data.source.type
                            }
                        </p>

                    </div>



                    <div>

                        <p className="text-sm text-muted-foreground">
                            Пользователей
                        </p>

                        <p>
                            {
                                data.users.length
                            }
                        </p>

                    </div>


                </CardContent>


            </Card>



            <MarketingSourceUsersTable

                users={
                    data.users
                }

            />


        </div>

    );

};


export default MarketingSourceDetailsContent;