import {
    Button,
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
import {DeleteIcon, Eye} from "lucide-react";


interface Props {
    nodes: VpnNode[];
    onOpenNode: (
        nodeId: number
    ) => void;
    onDeleteNode: (
        nodeId: number
    ) => void;
}


const NodesTable = ({
                        nodes,
                        onOpenNode,
                        onDeleteNode
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

                        <TableHead className="w-16 text-center">
                            Действия
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

                                {node.cpu_count ?? "-"}
                                {" "}
                                {node.cpu_model}

                            </TableCell>


                            <TableCell>

                                {node.memory_used
                                    ? `${Math.round(
                                        node.memory_used /
                                        1024 /
                                        1024 /
                                        1024
                                    )} GB`
                                    : "-"
                                }

                            </TableCell>


                            <TableCell>

                                {node.uptime_seconds
                                    ? `${Math.floor(
                                        node.uptime_seconds / 3600
                                    )} ч`
                                    : "-"
                                }

                            </TableCell>


                            <TableCell className="text-right">
                                <div className="flex space-x-2">
                                    <Button
                                        aria-label="Открыть узел"
                                        onClick={() => {
                                            onOpenNode(node.id);
                                        }}
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <Eye className="size-4" />
                                    </Button>
                                    <Button
                                        aria-label="Удалить узел"
                                        onClick={() => {
                                            onDeleteNode(node.id);
                                        }}
                                        size="icon"
                                        variant="danger"
                                    >
                                        <DeleteIcon className="size-4" />
                                    </Button>
                                </div>

                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>


            </Table>
        </TableContainer>
    );
};


export default NodesTable;