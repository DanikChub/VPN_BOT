import React from "react";
import { NavLink } from "react-router-dom";
import { type LucideIcon, ShieldCheck } from "lucide-react";

import { sidebarLinks } from "@/widgets/sidebar/config/sidebarLinks";

const Sidebar: React.FC = () => {
    return (
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-white p-4">
            <div className="mb-8 flex items-center gap-3 px-2 py-2">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <ShieldCheck
                        aria-hidden="true"
                        className="size-5"
                    />
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">
                        ВПН ИОРДАН
                    </p>

                    <p className="truncate text-xs text-slate-500">
                        Панель управления
                    </p>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {sidebarLinks.map(
                    ({
                         label,
                         path,
                         icon,
                     }) => (
                        <SidebarLink
                            key={path}
                            icon={icon}
                            label={label}
                            path={path}
                        />
                    )
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;

type SidebarLinkProps = {
    path: string;
    label: string;
    icon: LucideIcon;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
                                                     path,
                                                     label,
                                                     icon: Icon,
                                                 }) => {
    return (
        <NavLink
            className={({ isActive }) =>
                [
                    "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                    isActive
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")
            }
            to={path}
        >
            <Icon
                aria-hidden="true"
                className="size-5 shrink-0"
            />

            <span className="truncate">
                {label}
            </span>
        </NavLink>
    );
};