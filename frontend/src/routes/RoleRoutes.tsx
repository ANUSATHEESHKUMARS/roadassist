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

    console.log("AUTH USER:", user);
console.log("USER ROLE:", user.role);
console.log("ALLOWED ROLES:", allowedRoles);

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;