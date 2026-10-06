import { Navigate, Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import LandingPage from "@/pages/user/LandingPage";


const PublicRoute = () => {
    const user = useAuthStore((state) => state.user);

    console.log("PUBLIC ROUTE USER:", user);

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


export const publicRoutes: RouteObject[] = [
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/register",
                element: <Register />,
            },
            {
                path: "/verify-otp",
                element: <VerifyOtp />,
            },
            {
                path: "/",
                element:<LandingPage/>
            }
        ],
    },
];