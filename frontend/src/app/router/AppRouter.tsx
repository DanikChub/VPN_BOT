import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import AppLayout from "@/app/layouts/AppLayout";
import RequireAuth from "@/app/router/RequireAuth";

import {
    protectedRoutes,
    publicRoutes,
} from "./routes";

import {
    routePaths,
} from "@/shared/config/routePaths";

const AppRouter = () => {
    return (
        <Routes>
            {publicRoutes.map(
                ({ path, element }) => (
                    <Route
                        element={element}
                        key={path}
                        path={path}
                    />
                )
            )}

            <Route element={<RequireAuth />}>
                <Route element={<AppLayout />}>
                    {protectedRoutes.map(
                        ({ path, element }) => (
                            <Route
                                element={element}
                                key={path}
                                path={path}
                            />
                        )
                    )}
                </Route>
            </Route>

            <Route
                element={
                    <Navigate
                        replace
                        to={routePaths.main}
                    />
                }
                path="*"
            />
        </Routes>
    );
};

export default AppRouter;