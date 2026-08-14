import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui";


import {
    Eye,
    Copy,
} from "lucide-react";


import type {
    MarketingSource,
} from "@/entities/marketing-source";



interface Props {

    sources:
        MarketingSource[];

    onOpen:
        (
            id:number
        ) => void;

}



const MarketingSourcesTable = ({
                                   sources,
                                   onOpen,

                               }:Props) => {


    return (

        <TableContainer>

            <Table>


                <TableHeader>

                    <TableRow>


                        <TableHead>
                            ID
                        </TableHead>


                        <TableHead>
                            Название
                        </TableHead>


                        <TableHead>
                            Тип
                        </TableHead>


                        <TableHead>
                            Код
                        </TableHead>


                        <TableHead>
                            Пользователи
                        </TableHead>


                        <TableHead>
                            Ссылка
                        </TableHead>


                        <TableHead>
                            Действия
                        </TableHead>


                    </TableRow>


                </TableHeader>



                <TableBody>


                    {
                        sources.map(
                            (source)=>(

                                <TableRow
                                    key={source.id}
                                >


                                    <TableCell>
                                        {source.id}
                                    </TableCell>


                                    <TableCell>

                                        <p className="font-medium">
                                            {source.name}
                                        </p>

                                    </TableCell>



                                    <TableCell>

                                        {source.type}

                                    </TableCell>



                                    <TableCell>

                                        {source.code}

                                    </TableCell>



                                    <TableCell>

                                        {source.users_count ?? 0}

                                    </TableCell>



                                    <TableCell>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={()=>{
                                                navigator.clipboard.writeText(
                                                    source.telegram_link
                                                );
                                            }}
                                        >

                                            <Copy className="size-4"/>

                                        </Button>

                                    </TableCell>



                                    <TableCell>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={()=>{
                                                onOpen(
                                                    source.id
                                                );
                                            }}
                                        >

                                            <Eye className="size-4"/>

                                        </Button>


                                    </TableCell>



                                </TableRow>

                            ))
                    }


                </TableBody>


            </Table>


        </TableContainer>

    );
};



export default MarketingSourcesTable;