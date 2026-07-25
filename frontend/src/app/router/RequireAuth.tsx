import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

import {
    LoaderCircle,
} from "lucide-react";

import {
    useAuth,
} from "@/features/auth";

import {
    routePaths,
} from "@/shared/config/routePaths";

const RequireAuth = () => {
    const location = useLocation();

    const {
        isAuthenticated,
        isInitializing,
    } = useAuth();

    if (isInitializing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <LoaderCircle
                        className="size-5 animate-spin"
                    />

                    Проверяем сессию...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                replace
                state={{
                    from: location,
                }}
                to={routePaths.login}
            />
        );
    }

    return <Outlet />;
};

export default RequireAuth;