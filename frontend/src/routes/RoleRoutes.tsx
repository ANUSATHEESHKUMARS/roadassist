import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type UserRole = "user" | "admin" | "mechanic" | "superadmin";

interface RoleRouteProps {
    allowedRoles: UserRole[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {

    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;