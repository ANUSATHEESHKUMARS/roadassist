
import React from "react";
import { Bell, ArrowLeftRight } from "lucide-react";
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

export const MechanicHeader: React.FC = () => {
    const { showToast } = useToast();
    const user = useAuthStore((state) => state.user);
    const switchRole = useAuthStore((state) => state.switchRole);
    const isSwitchingRole = useAuthStore(
        (state) => state.isSwitchingRole
    );

    const navigate = useNavigate();

    const initials = user?.fullName
        ?.split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const handleSwitchToUser = async () => {
        if (isSwitchingRole) return;

        try {
            await switchRole("user");

            navigate("/user", { replace: true });

            showToast("Switched to User portal", "success");
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "Unable to switch role",
                "error"
            );
        }
    };

    const onLogout = async () => {
        try {
            await handleLogout();

            showToast("Logged out successfully", "success");

            navigate("/login", { replace: true });
        } catch {
            showToast("Unable to logout. Please try again.", "error");
        }
    };

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-8">

            {/* Left Section */}
            <div>
                <p className="text-sm font-semibold text-foreground">
                    Mechanic Portal
                </p>
                <p className="text-xs text-muted-foreground">
                    Manage your roadside assistance services
                </p>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 sm:gap-4">

                {/* Notifications */}
                <button
                    type="button"
                    className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Notifications"
                >
                    <Bell className="size-4" />
                </button>

                <div className="hidden h-5 w-px bg-border sm:block" />

                {/* Mechanic Information */}
                <div className="hidden items-center gap-2 sm:flex">
                    <div className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold">
                        {initials || "M"}
                    </div>

                    <div className="max-w-32">
                        <p className="truncate text-xs font-semibold">
                            {user?.fullName ?? "Mechanic"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Mechanic Partner
                        </p>
                    </div>
                </div>

                {/* Switch to User */}
                {user?.roles?.includes("user") && (
                    <button
                        type="button"
                        onClick={handleSwitchToUser}
                        disabled={isSwitchingRole}
                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                    >
                        <ArrowLeftRight className="size-4" />
                        <span className="hidden sm:inline">
                            {isSwitchingRole
                                ? "Switching..."
                                : "Switch to User"}
                        </span>
                    </button>
                )}

                {/* Logout */}
                <AlertDialog>
                    <AlertDialogTrigger >
                        <button
                            type="button"
                            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                                You will be signed out of your RoadAssist account.
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
        </header>
    );
};
