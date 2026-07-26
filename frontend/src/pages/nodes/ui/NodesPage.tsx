import {
    Server,
} from "lucide-react";

import NodesList from "@/widgets/nodes";

import {
    Page,
    PageContent,
    PageHeader,
} from "@/shared/ui";
import CreateVpnNodeModal from "@/widgets/nodes/ui/CreateVpnNodeDialog.tsx";
import {useRef} from "react";


const NodesPage = () => {
    const refetchNodes =
        useRef<
            (() => Promise<void>) | null
        >(null);

    return (
        <Page>

            <PageHeader
                description="Управление VPN-серверами и состоянием узлов"

                icon={
                    <Server className="size-5" />
                }

                title="Узлы"

                actions={
                    <CreateVpnNodeModal

                        onCreated={() => {

                            void refetchNodes.current?.();

                        }}

                    />
                }
            />


            <PageContent>

                <NodesList
                    onReady={(refetch) => {
                        refetchNodes.current = refetch;
                    }}
                />

            </PageContent>


        </Page>
    );
};


export default NodesPage;