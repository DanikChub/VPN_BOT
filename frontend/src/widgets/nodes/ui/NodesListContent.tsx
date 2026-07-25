
import {Card, CardContent, EmptyState, Spinner} from "@/shared/ui";
import {Server} from "lucide-react";
import type {VpnNode} from "@/entities/vpn-node";
import NodesTable from "@/widgets/nodes/ui/NodesTable.tsx";

interface VpnNodeContentProps {
    nodes: VpnNode[];
    isLoading: boolean;
    errorMessage: string | null;

}

const UsersListContent = ({
                              nodes,
                              isLoading,
                              errorMessage,


                          }: VpnNodeContentProps) => {
    if (errorMessage) {
        return (
            <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {errorMessage}
            </div>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex min-h-72 items-center justify-center">
                    <Spinner size="lg" />
                </CardContent>
            </Card>
        );
    }

    if (nodes.length === 0) {
        return (
            <EmptyState
                description="Попробуйте изменить поисковый запрос или выбранный фильтр."
                icon={
                    <Server className="size-6" />
                }
                title="Пользователи не найдены"
            />
        );
    }

    return (
        <NodesTable
            nodes={nodes}
        />
    );
}


export default UsersListContent;