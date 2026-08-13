import type {
    ReactNode,
} from "react";

import MainPage from "@/pages/main";
import UsersPage from "@/pages/users";
import LoginPage from "@/pages/login";
import NodesPage from "@/pages/nodes";
import UserDetailsPage from "@/pages/user-details";

import {
    routePaths,
} from "@/shared/config/routePaths";
import PlansPage from "@/pages/plans";
import NodeDetailsPage from "@/pages/node-details";


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
        path: routePaths.userDetails,
        element: <UserDetailsPage />,
    },

    {
        path: routePaths.nodes,
        element: <NodesPage />,
    },

    {
        path: routePaths.nodeDetails,
        element: <NodeDetailsPage/>
    },

    {
        path: routePaths.plans,
        element: <PlansPage />,
    },

];