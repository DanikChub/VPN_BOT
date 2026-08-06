import {
    CreditCard,
    type LucideIcon,
} from "lucide-react";

import {
    House,
    Users,
    Server
} from "lucide-react";

import {
    routePaths,
} from "@/shared/config/routePaths.ts";

interface SidebarLink {
    label: string;
    path: string;
    icon: LucideIcon;
}

export const sidebarLinks: SidebarLink[] = [
    {
        label: "Главная",
        path: routePaths.main,
        icon: House,
    },
    {
        label: "Пользователи",
        path: routePaths.users,
        icon: Users,
    },
    {
        label: "Узлы",
        path: routePaths.nodes,
        icon: Server,
    },

    {
        label: "Тарифы",
        path: routePaths.plans,
        icon: CreditCard,
    },

];