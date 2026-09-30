import React from "react";
import { Bell, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "@/utils/logoutHandler";
import { useToast } from "@/components/ui/toast/ToastProvider";
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
const {showToast} = useToast()
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  console.log("header user:", user);

  const initials = user?.fullName
    ?.split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onLogout = async () => {
    await handleLogout();
  showToast(
    "Logged out successfully",
    "success"
  );
    navigate("/login", {
      replace: true,
    });
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
              {user?.role ?? "user"}
            </p>

          </div>

          {/* Avatar */}
          <div className="h-9 w-9 rounded-full bg-muted text-foreground border border-border flex items-center justify-center text-xs font-bold">
            {initials || "U"}
          </div>

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