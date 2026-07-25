import useNodesList from "@/widgets/nodes/model";
import {useEffect} from "react";
import NodesListContent from "@/widgets/nodes/ui/NodesListContent.tsx";

interface NodesListProps {
    onRefetchReady?: (
        refetch: () => Promise<void>
    ) => void;
}

const NodesList = ({
                       onRefetchReady,
                   }: NodesListProps) => {

    const {
        nodes,
        status,
        refetch,
    } = useNodesList();


    useEffect(() => {
        onRefetchReady?.(refetch);
    }, []);


    return (
        <NodesListContent
            isLoading={status.isLoading}
            errorMessage={status.errorMessage}
            nodes={nodes}
        />
    );
};


export default NodesList;