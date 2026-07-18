import {MAIN_ROUTE, USERS_ROUTE} from "@/shared/config/routePaths.ts";
import MainPage from "@/pages/main";
import UsersPage from "@/pages/users";



export const routes = [
    {
        path: MAIN_ROUTE,
        element: <MainPage/>
    },
    {
        path: USERS_ROUTE,
        element: <UsersPage/>
    }
]