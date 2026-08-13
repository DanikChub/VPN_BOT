import {
    ArrowLeft,
    Server,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    NodeDetails,
} from "@/widgets/node-details";

import {
    Button,
    Page,
    PageContent,
    PageHeader,
} from "@/shared/ui";


const NodeDetailsPage = () => {
    const navigate =
        useNavigate();


    return (
        <Page>
            <PageHeader
                description="Просмотр состояния и конфигурации VPN-ноды"
                icon={
                    <Server className="size-5" />
                }
                title="VPN-нода"
            />

            <PageContent>
                <div className="mb-5">
                    <Button
                        leftIcon={
                            <ArrowLeft className="size-4" />
                        }
                        onClick={() => {
                            navigate(-1);
                        }}
                        size="sm"
                        variant="ghost"
                    >
                        Назад
                    </Button>
                </div>

                <NodeDetails />
            </PageContent>
        </Page>
    );
};


export default NodeDetailsPage;