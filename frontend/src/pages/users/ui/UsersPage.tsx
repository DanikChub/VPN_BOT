
import UsersList from "@/widgets/users-list";
import {Page, PageContent, PageHeader} from "@/shared/ui";
import {Users} from "lucide-react";


const UsersPage = () => {
    return (
        <Page>
            <PageHeader
                description="Просмотр пользователей, балансов и состояния подписок"
                icon={<Users className="size-5" />}
                title="Пользователи"
            />

            <PageContent>
                <UsersList />
            </PageContent>
        </Page>
    );
};

export default UsersPage;