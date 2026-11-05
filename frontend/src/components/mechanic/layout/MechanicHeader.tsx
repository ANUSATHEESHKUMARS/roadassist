import React from "react";
import { Menu, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { handleLogout } from "@/utils/logoutHandler";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { switchActiveRole } from "@/services/authService";
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

interface MechanicHeaderProps {
    onMenuClick: () => void;
}

export const MechanicHeader: React.FC<MechanicHeaderProps> = ({
    onMenuClick,
}) => {
    const { showToast } = useToast();
    const user = useAuthStore((state) => state.user);
    const updateActiveRole = useAuthStore((state) => state.updateActiveRole);
    const navigate = useNavigate();

    const initials = user?.fullName
        ?.split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const onLogout = async () => {
        await handleLogout();
        showToast("Logged out successfully", "success");
        navigate("/login", { replace: true });
    };

    const handleSwitchToUser = async () => {
        try {
            const response = await switchActiveRole("user");
            if (response.success && response.data) {
                updateActiveRole(response.data.activeRole, response.data.roles);
                showToast("Switched to user mode", "success");
                navigate("/user", { replace: true });
            }
        } catch {
            showToast("Failed to switch role", "error");
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xs sm:px-6 lg:px-8">

            {/* Left: Mobile Navigation Trigger & Brand Indicator */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:hidden"
                    aria-label="Open sidebar navigation"
                >
                    <Menu className="h-4 w-4" />
                </button>

                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:inline">
                    Mechanic Portal
                </span>
            </div>

            {/* Right: Notification + User Info + Actions */}
            <div className="flex items-center gap-3 sm:gap-4">

                {/* Switch to User Mode */}
                <button
                    type="button"
                    onClick={handleSwitchToUser}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    Switch to User
                </button>

                <div className="h-5 w-px bg-border" aria-hidden="true" />

                {/* Notification */}
                <button
                    type="button"
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="View notifications"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                </button>

                <div className="h-5 w-px bg-border" aria-hidden="true" />

                {/* Mechanic Info */}
                <div className="flex items-center gap-2.5">
                    <div className="hidden flex-col text-right sm:flex">
                        <span className="text-xs font-semibold leading-none text-foreground">
                            {user?.fullName ?? "Mechanic"}
                        </span>
                        <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-primary">
                            Mechanic
                        </span>
                    </div>

                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary font-mono text-xs font-bold text-foreground"
                        aria-label="Mechanic avatar"
                    >
                        {initials || "M"}
                    </div>
                </div>

                {/* Logout Confirmation */}
                <AlertDialog>
                    <AlertDialogTrigger className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Logout
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you sure you want to logout?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                You will be signed out of your RoadAssist mechanic account and
                                redirected to the login page.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
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

