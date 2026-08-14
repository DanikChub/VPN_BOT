import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui";


import type {
    MarketingSourceUser,
} from "@/entities/marketing-source";



interface Props {

    users:
        MarketingSourceUser[];

}



const MarketingSourceUsersTable = ({
                                       users,

                                   }:Props)=>{


    return (

        <TableContainer>

            <Table>


                <TableHeader>

                    <TableRow>

                        <TableHead>
                            ID
                        </TableHead>


                        <TableHead>
                            Telegram ID
                        </TableHead>


                        <TableHead>
                            Username
                        </TableHead>


                        <TableHead>
                            Имя
                        </TableHead>


                        <TableHead>
                            Регистрация
                        </TableHead>


                    </TableRow>

                </TableHeader>



                <TableBody>


                    {
                        users.map(
                            (user)=>(

                                <TableRow
                                    key={user.id}
                                >

                                    <TableCell>
                                        {user.id}
                                    </TableCell>


                                    <TableCell>
                                        {user.telegramId}
                                    </TableCell>


                                    <TableCell>
                                        {
                                            user.username
                                                ?
                                                `@${user.username}`
                                                :
                                                "-"
                                        }
                                    </TableCell>


                                    <TableCell>
                                        {
                                            user.firstName
                                            ??
                                            "-"
                                        }
                                    </TableCell>


                                    <TableCell>
                                        {
                                            new Date(
                                                user.createdAt
                                            )
                                                .toLocaleDateString(
                                                    "ru-RU"
                                                )
                                        }
                                    </TableCell>


                                </TableRow>

                            ))
                    }


                </TableBody>


            </Table>


        </TableContainer>

    );

};


export default MarketingSourceUsersTable;