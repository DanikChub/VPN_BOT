import {
    Outlet,
} from "react-router-dom";

import Sidebar from "@/widgets/sidebar/ui/Sidebar";

const AppLayout = () => {
    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="min-h-screen pl-64">
                <Outlet/>
            </main>
        </div>
    );
};

export default AppLayout;