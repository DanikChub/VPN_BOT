import type {
    ReactNode,
} from "react";

import MainPage from "@/pages/main";
import UsersPage from "@/pages/users";
import LoginPage from "@/pages/login";
import NodesPage from "@/pages/nodes";

import {
    routePaths,
} from "@/shared/config/routePaths";


export interface AppRoute {
    path: string;
    element: ReactNode;
}

export const publicRoutes: AppRoute[] = [
    {
        path: routePaths.login,
        element: <LoginPage />,
    },
];

export const protectedRoutes: AppRoute[] = [
    {
        path: routePaths.main,
        element: <MainPage />,
    },
    {
        path: routePaths.users,
        element: <UsersPage />,
    },
    {
        path: routePaths.nodes,
        element: <NodesPage />,
    },
];