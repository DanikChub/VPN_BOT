import {
    useParams,
} from "react-router-dom";

import useNodeDetails
    from "../model";

import NodeDetailsContent
    from "./NodeDetailsContent";


export function NodeDetails() {
    const {
        id,
    } = useParams<{
        id: string;
    }>();

    const nodeId =
        Number(id);

    const isValidNodeId =
        Number.isInteger(
            nodeId,
        ) &&
        nodeId > 0;


    if (!isValidNodeId) {
        return (
            <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                Некорректный ID ноды
            </div>
        );
    }


    return (
        <NodeDetailsLoader
            nodeId={nodeId}
        />
    );
}


interface NodeDetailsLoaderProps {
    nodeId: number;
}


function NodeDetailsLoader({
                               nodeId,
                           }: NodeDetailsLoaderProps) {
    const {
        node,
        status,
        actions,
    } =
        useNodeDetails(
            nodeId,
        );

    return (
        <NodeDetailsContent
            node={node}
            isLoading={
                status.isLoading
            }
            errorMessage={
                status.errorMessage
            }
            onReload={
                actions.reload
            }
        />
    );
}