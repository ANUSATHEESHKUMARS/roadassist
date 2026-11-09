import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/admin/auth";
import { useToast } from "@/components/ui/toast/ToastProvider";

interface RoleSwitchButtonProps {
    targetRole: UserRole;
    label: string;
}

const RoleSwitchButton = ({
    targetRole,
    label,
}: RoleSwitchButtonProps) => {
    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);
    const switchRole = useAuthStore((state) => state.switchRole);
    const isSwitchingRole = useAuthStore(
        (state) => state.isSwitchingRole
    );

    const { showToast } = useToast();

    const handleSwitchRole = async () => {
        if (!user || !user.roles.includes(targetRole)) {
            showToast(
                "You are not authorized for this role",
                "error"
            );
            return;
        }

        try {
            await switchRole(targetRole);

            if (targetRole === "mechanic") {
                navigate("/mechanic", { replace: true });
            } else if (targetRole === "user") {
                navigate("/user", { replace: true });
            } else if (targetRole === "admin") {
                navigate("/admin", { replace: true });
            } else if (targetRole === "superadmin") {
                navigate("/superadmin", { replace: true });
            }

            showToast(
                `Switched to ${targetRole} portal`,
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

    return (
        <button
            type="button"
            onClick={handleSwitchRole}
            disabled={isSwitchingRole}
            className="rounded-lg border px-4 py-2 text-sm font-medium
                       transition hover:bg-muted disabled:cursor-not-allowed
                       disabled:opacity-50"
        >
            {isSwitchingRole
                ? "Switching..."
                : label}
        </button>
    );
};

export default RoleSwitchButton;