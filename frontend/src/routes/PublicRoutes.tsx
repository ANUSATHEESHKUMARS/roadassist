import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const PublicRoute = () => {
    const user = useAuthStore((state) => state.user);

    if (user) {
        if (user.role === "superadmin") {
            return <Navigate to="/superadmin/admins" replace />;
        }

        if (user.role === "admin") {
            return <Navigate to="/admin/users" replace />;
        }

        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;