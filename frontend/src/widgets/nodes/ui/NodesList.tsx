import useNodesList from "@/widgets/nodes/model";
import {useEffect} from "react";
import NodesListContent from "@/widgets/nodes/ui/NodesListContent.tsx";
import {getNodeDetailsPath} from "@/shared/config/routePaths.ts";
import {useNavigate} from "react-router-dom";
import {vpnNodeApi} from "@/entities/vpn-node";

interface NodesListProps {
    onRefetchReady?: (
        refetch: () => Promise<void>
    ) => void;
}

const NodesList = ({
                       onRefetchReady,
                   }: NodesListProps) => {

    const navigate = useNavigate();

    const {
        nodes,
        status,
        refetch,
    } = useNodesList();


    useEffect(() => {
        onRefetchReady?.(refetch);
    }, []);

    const openNode = (
        nodeId: number
    ): void => {
        navigate(
            getNodeDetailsPath(nodeId)
        );
    };

    const deleteNode = async (
        nodeId: number,
    ): Promise<void> => {
        const node =
            nodes.find(
                (item) =>
                    item.id === nodeId,
            );

        const nodeName =
            node?.display_name ??
            node?.name ??
            `#${nodeId}`;

        const confirmed =
            window.confirm(
                `Удалить ноду "${nodeName}"?\n\nЭто действие нельзя отменить.`,
            );

        if (!confirmed) {
            return;
        }

        await vpnNodeApi.delete(
            nodeId,
        );

        await refetch();
    };


    return (
        <NodesListContent
            isLoading={status.isLoading}
            errorMessage={status.errorMessage}
            nodes={nodes}
            onOpenNode={openNode}
            onDeleteNode={deleteNode}
        />
    );
};


export default NodesList;