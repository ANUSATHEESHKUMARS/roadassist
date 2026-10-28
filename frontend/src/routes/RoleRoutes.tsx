import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type UserRole = "user" | "admin" | "mechanic" | "superadmin";

interface RoleRouteProps {
    allowedRoles: UserRole[];
}

/**
 * Returns the default redirect path for a given role.
 * This prevents infinite redirect loops when a role does not match
 * the allowedRoles of the current route.
 */
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

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={getDefaultPathForRole(user.role)} replace />;
    }

    return <Outlet />;
};

export default RoleRoute;