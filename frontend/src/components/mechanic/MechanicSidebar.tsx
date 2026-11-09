
import React from "react";
import { NavLink } from "react-router-dom";
import {
    Activity,
    BriefcaseBusiness,
    CalendarDays,
    UserRound,
    Settings,
    Wrench,
} from "lucide-react";

const mainNavItems = [
    {
        label: "Dashboard",
        icon: Activity,
        path: "/mechanic/dashboard",
    },
    {
        label: "Service Requests",
        icon: BriefcaseBusiness,
        path: "/mechanic/service-requests",
    },
    {
        label: "Bookings",
        icon: CalendarDays,
        path: "/mechanic/bookings",
    },
];

const bottomNavItems = [
    {
        label: "My Profile",
        icon: UserRound,
        path: "/mechanic/profile",
    },
    {
        label: "Settings",
        icon: Settings,
        path: "/mechanic/settings",
    },
];

export const MechanicSidebar: React.FC = () => {
    return (
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border bg-card md:flex">

            {/* Top Section */}
            <div>
                {/* Brand */}
                <div className="flex h-16 items-center gap-3 border-b border-border px-5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Wrench className="size-5" />
                    </div>

                    <div>
                        <p className="text-sm font-bold">
                            RoadAssist
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Mechanic Portal
                        </p>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="space-y-1 p-3">
                    {mainNavItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/mechanic/dashboard"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`
                                }
                            >
                                <Icon className="size-4 shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Navigation */}
            <div className="space-y-1 border-t border-border p-3">
                {bottomNavItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`
                            }
                        >
                            <Icon className="size-4 shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </aside>
    );
};
