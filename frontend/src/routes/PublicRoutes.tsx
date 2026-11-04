
import { Navigate, Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import LandingPage from "@/pages/user/LandingPage";
import ForgotPassword from "@/pages/auth/ForgetPassword";
import VerifyResetOtp from "@/pages/auth/VerifyResetOtp";
import ResetPassword from "@/pages/auth/ResetPassword";

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

import type { UserRole } from "@/types/admin/auth";

const PublicRoute = () => {
    const user = useAuthStore((state) => state.user);

    if (user) {
        return (
            <Navigate
                to={getDefaultPathForRole(user.activeRole)}
                replace
            />
        );
    }

    return <Outlet />;
};

export default PublicRoute;

export const publicRoutes: RouteObject[] = [
    {
        element: <PublicRoute />,
        children: [
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
            { path: "/verify-otp", element: <VerifyOtp /> },
            { path: "/forget-password", element: <ForgotPassword /> },
            { path: "/verify-reset-otp", element: <VerifyResetOtp /> },
            { path: "/reset-password", element: <ResetPassword /> },
            { path: "/", element: <LandingPage /> },
        ],
    },
];
