
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type UserRole = "user" | "admin" | "mechanic" | "superadmin";

interface RoleRouteProps {
    allowedRoles: UserRole[];
}

const getDefaultPathForRole = (role: UserRole): string => {
    switch (role) {
        case "superadmin":
            return "/superadmin/admins";
        case "admin":
            return "/admin/users";
        case "mechanic":
            return "/mechanic/dashboard";
        case "user":
        default:
            return "/user";
    }
};

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check whether the user's active role is among the permitted roles
    const hasPermission = allowedRoles.includes(user.activeRole);

    if (!hasPermission) {
        return (
            <Navigate
                to={getDefaultPathForRole(user.activeRole)}
                replace
            />
        );
    }

    return <Outlet />;
};

export default RoleRoute;
