import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarCheck,
    Wrench,
    X,
    ArrowLeftRight,
} from "lucide-react";

interface MechanicSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    disabled?: boolean;
}

const navItems: NavItem[] = [
    {
        label: "Dashboard",
        path: "/mechanic/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Bookings",
        path: "/mechanic/bookings",
        icon: CalendarCheck,
        disabled: true,
    },
    {
        label: "Application Status",
        path: "/user/mechanic-application",
        icon: ArrowLeftRight,
    },
];

export const MechanicSidebar: React.FC<MechanicSidebarProps> = ({
    isOpen,
    onClose,
}) => {
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs md:hidden"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out md:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                aria-label="Mechanic Navigation"
            >
                {/* Brand Header */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                            <Wrench className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading text-sm font-bold tracking-tight text-foreground">
                                RoadAssist
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                Mechanic Portal
                            </span>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:hidden"
                        aria-label="Close navigation"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Menu
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            if (item.disabled) {
                                return (
                                    <div
                                        key={item.path}
                                        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground/50"
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span>{item.label}</span>
                                        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                                            Soon
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring ${
                                            isActive
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`
                                    }
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
};

