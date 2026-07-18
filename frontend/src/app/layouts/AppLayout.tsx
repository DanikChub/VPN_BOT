
import AppRouter from "@/app/router/AppRouter.tsx";
import Sidebar from "@/widgets/sidebar/ui/Sidebar.tsx";


const AppLayout = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar/>

            <main className="min-w-0 flex-1">
                <AppRouter/>
            </main>

        </div>
    );
};

export default AppLayout;