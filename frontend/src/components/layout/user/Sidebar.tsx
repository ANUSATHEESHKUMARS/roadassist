
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Car,
  AlertTriangle,
  Wrench,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { switchActiveRole } from "@/services/authService";
import { getMyMechanicApplication } from "@/services/mechanic/mechanicApplicaitonService";
import { handleLogout } from "@/utils/logoutHandler";

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
  const user = useAuthStore((state) => state.user);
  const updateActiveRole = useAuthStore((state) => state.updateActiveRole);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const response = await getMyMechanicApplication();
        if (!cancelled) {
          setApplicationStatus(response.data?.status ?? null);
        }
      } catch {
        // Silently fail — show default "Become a Mechanic" link
      }
    };

    void fetchStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSwitchToMechanic = async () => {
    try {
      const response = await switchActiveRole("mechanic");
      if (response.success && response.data) {
        updateActiveRole(response.data.activeRole, response.data.roles);
        showToast("Switched to mechanic mode", "success");
        navigate("/mechanic/dashboard", { replace: true });
      }
    } catch {
      showToast("Failed to switch role", "error");
    }
  };

  const onLogout = async () => {
    await handleLogout();
    showToast("Logged out successfully", "success");
    navigate("/login", { replace: true });
  };


const getMechanicNavItem = () => {
  // Approved mechanic — show dashboard shortcut
  if (
    applicationStatus === "approved" &&
    user?.roles?.includes("mechanic")
  ) {
    return {
      label: "Mechanic Dashboard",
      icon: LayoutDashboard,
      path: "/mechanic/dashboard",
      onClick: handleSwitchToMechanic,
    };
  }

  // Application exists — show application status
  if (
    applicationStatus === "pending" ||
    applicationStatus === "under_review" ||
    applicationStatus === "rejected" ||
    applicationStatus === "changes_requested" ||
    applicationStatus === "incomplete"
  ) {
    return {
      label: "Application Status",
      icon:
        applicationStatus === "pending" ||
        applicationStatus === "under_review"
          ? Clock
          : Wrench,
      path: "/user/mechanic-application",
      onClick: undefined,
    };
  }

  // No application — show onboarding
  return {
    label: "Become a Mechanic",
    icon: Wrench,
    path: "/mechanic/onboarding",
    onClick: undefined,
  };
};


  const mechanicNavItem = getMechanicNavItem();

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
      label: mechanicNavItem.label,
      icon: mechanicNavItem.icon,
      path: mechanicNavItem.path,
      onClick: mechanicNavItem.onClick,
    },
  ];

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

            // If item has an onClick (mechanic dashboard switch), render a button-like link
            if (item.onClick) {
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-muted-foreground hover:text-foreground hover:bg-muted text-left"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${isActive
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
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${isActive
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
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
