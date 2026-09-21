import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  Users,
  Radio,
  BarChart3,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Car,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Technicians", icon: Wrench, path: "/admin/mechanics" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Service Requests", icon: Radio, path: "/admin/service-requests" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Compliance", icon: ShieldCheck, path: "/admin/compliance" },
];

export const AdminSidebar: React.FC = () => {
  return (
<aside className="w-64 border-r border-border bg-card flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-40">
      <div>
        {/* RoadAssist Enterprise Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Car className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-foreground">
              RoadAssist
            </div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
              Enterprise Admin
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Support & Logout */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support Center</span>
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};