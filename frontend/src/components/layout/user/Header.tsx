
import React from "react";
import { Bell, Menu, ArrowLeftRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "@/utils/logoutHandler";
import { useToast } from "@/components/ui/toast/ToastProvider";
import type { UserRole } from "@/types/admin/auth";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Header: React.FC = () => {
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const switchRole = useAuthStore((state) => state.switchRole);
  const isSwitchingRole = useAuthStore(
    (state) => state.isSwitchingRole
  );

  const navigate = useNavigate();

  const targetRole: UserRole | null =
    user?.activeRole === "user" && user.roles.includes("mechanic")
      ? "mechanic"
      : user?.activeRole === "mechanic" && user.roles.includes("user")
        ? "user"
        : null;

  const handleRoleSwitch = async () => {
    if (!targetRole || isSwitchingRole) return;

    try {
      await switchRole(targetRole);

      navigate(
        targetRole === "mechanic"
          ? "/mechanic/dashboard"
          : "/user",
        { replace: true }
      );

      showToast(
        `Switched to ${targetRole === "mechanic" ? "Mechanic" : "User"} portal`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to switch role",
        "error"
      );
    }
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onLogout = async () => {
    try {
      await handleLogout();

      showToast("Logged out successfully", "success");

      navigate("/login", {
        replace: true,
      });
    } catch {
      showToast("Unable to logout. Please try again.", "error");
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">

      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden sm:inline">
          Vehicle Assistance Portal
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />

          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="h-5 w-px bg-border" />

        {/* User Information */}
        <div className="flex items-center gap-3 pl-1">

          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-tight">
              {user?.fullName ?? "User"}
            </p>

            <p className="text-[11px] text-muted-foreground capitalize">
              {user?.activeRole ?? "user"}
            </p>
          </div>

          {/* Avatar */}
          <div className="h-9 w-9 rounded-full bg-muted text-foreground border border-border flex items-center justify-center text-xs font-bold">
            {initials || "U"}
          </div>

          {/* Role Switch */}
          {targetRole && (
            <button
              type="button"
              onClick={handleRoleSwitch}
              disabled={isSwitchingRole}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeftRight className="size-4" />

              <span className="hidden sm:inline">
                {isSwitchingRole
                  ? "Switching..."
                  : `Switch to ${targetRole === "mechanic" ? "Mechanic" : "User"}`}
              </span>
            </button>
          )}

          {/* Logout */}
          <AlertDialog>
            <AlertDialogTrigger >
              <button
                type="button"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to logout?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  You will be signed out of your RoadAssist account and redirected to the
                  login page.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction onClick={onLogout}>
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </div>
    </header>
  );
};
