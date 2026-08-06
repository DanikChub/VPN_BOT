import {
    ArrowLeft,
    UserRound,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    UserDetails,
} from "@/widgets/user-details";

import {
    Button,
    Page,
    PageContent,
    PageHeader,
} from "@/shared/ui";


const UserDetailsPage = () => {
    const navigate =
        useNavigate();

    return (
        <Page>
            <PageHeader
                description="Просмотр пользователя и управление подпиской"
                icon={
                    <UserRound className="size-5" />
                }
                title="Пользователь"
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

                <UserDetails />
            </PageContent>
        </Page>
    );
};


export default UserDetailsPage;