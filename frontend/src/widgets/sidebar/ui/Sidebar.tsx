import React from 'react';
import {sidebarLinks} from "@/shared/config/sidebarLinks.ts";
import {NavLink} from "react-router-dom";

const Sidebar: React.FC = () => {

    return (
        <div className="
            fixed
            left-0 top-0
            h-full
            w-60
            shrink-0
            bg-white
            border-r
            border-gray-200">
            {sidebarLinks.map(({label, path}) => (
                <SidebarLink key={path} path={path} label={label}/>
            ))}
        </div>
    );
};

export default Sidebar;

type SidebarLinkProps = {
    path: string;
    label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({path, label}) => {
    return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                `
                flex 
                items-center 
                justify-between 
                px-4 py-2 
                mb-2 
                rounded-lg 
                transition-all 
                duration-200
                hover:bg-blue-50 hover:text-blue-700
                ${
                isActive ? 
                    "bg-blue-500 text-blue-700 text-white font-semibold shadow-md"
                        : 
                    "text-gray-700"
                }`
            }
        >
            {label}
        </NavLink>
    )
}