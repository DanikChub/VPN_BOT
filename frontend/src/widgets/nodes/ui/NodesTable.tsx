import {
    Table,
    TableBody,
    TableCell, TableContainer,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui";

import {
    VpnNodeStatusBadge,
    type VpnNode,
} from "@/entities/vpn-node";


interface Props {
    nodes: VpnNode[];
}


const NodesTable = ({
                        nodes,
                    }: Props) => {


    return (
        <TableContainer>
            <Table>

                <TableHeader>

                    <TableRow>

                        <TableHead>
                            ID
                        </TableHead>

                        <TableHead>
                            Сервер
                        </TableHead>

                        <TableHead>
                            Адрес
                        </TableHead>

                        <TableHead>
                            Статус
                        </TableHead>

                        <TableHead>
                            CPU
                        </TableHead>

                        <TableHead>
                            RAM
                        </TableHead>

                        <TableHead>
                            Uptime
                        </TableHead>

                    </TableRow>

                </TableHeader>


                <TableBody>

                    {nodes.map((node) => (

                        <TableRow
                            key={node.id}
                        >

                            <TableCell>
                                {node.id}
                            </TableCell>


                            <TableCell>

                                <p className="font-medium">
                                    {node.name}
                                </p>

                            </TableCell>


                            <TableCell>

                                {node.host}:{node.port}

                            </TableCell>


                            <TableCell>

                                <VpnNodeStatusBadge
                                    node={node}
                                />

                            </TableCell>


                            <TableCell>

                                {node.cpu.count ?? "-"}
                                {" "}
                                {node.cpu.model}

                            </TableCell>


                            <TableCell>

                                {node.memory.used
                                    ? `${Math.round(
                                        node.memory.used /
                                        1024 /
                                        1024 /
                                        1024
                                    )} GB`
                                    : "-"
                                }

                            </TableCell>


                            <TableCell>

                                {node.uptimeSeconds
                                    ? `${Math.floor(
                                        node.uptimeSeconds / 3600
                                    )} ч`
                                    : "-"
                                }

                            </TableCell>


                        </TableRow>

                    ))}

                </TableBody>


            </Table>
        </TableContainer>
    );
};


export default NodesTable;