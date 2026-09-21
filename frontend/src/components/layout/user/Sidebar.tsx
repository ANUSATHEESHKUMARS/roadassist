import React from "react";
import { NavLink } from "react-router-dom";
import {
  Car,
  AlertTriangle,
  History,
  Bell,
  CreditCard,
  User,
  Settings,
  LogOut,
  Wrench,
} from "lucide-react";

const mainNavItems = [
  {
    label: "My Vehicles",
    icon: Car,
    path: "/user/vehicles",
  },
  {
    label: "Emergency Assistance",
    icon: AlertTriangle,
    path: "/user/emergency",
  },
  {
    label: "Service History",
    icon: History,
    path: "/user/history",
  },
  {
    label: "Notifications",
    icon: Bell,
    path: "/user/notifications",
  },
  {
    label: "Payments",
    icon: CreditCard,
    path: "/user/payments",
  },
];

const bottomNavItems = [
  {
    label: "Profile",
    icon: User,
    path: "/user/profile",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/user/settings",
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30 hidden md:flex">

      {/* Top Section */}
      <div>

        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-2.5 border-b border-border">

          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground leading-tight">
              RoadAssist
            </span>

            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Enterprise
            </span>
          </div>

        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1">

          {mainNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-border space-y-1">

        {bottomNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />

              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Logout */}
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />

          <span>Logout</span>
        </button>

      </div>
    </aside>
  );
};