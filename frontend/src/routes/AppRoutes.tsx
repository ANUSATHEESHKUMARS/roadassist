import { Navigate, useRoutes } from "react-router-dom";

import { publicRoutes } from "./PublicRoutes";
import { userRoutes } from "./UserRoutes";
import { adminRoutes } from "./AdminRoutes";
import { superAdminRoutes } from "./SuperAdminRoutes";
import { mechanicRoutes } from "./MechanicRoutes";

export const AppRoutes = () => {

    const routes = [
        ...publicRoutes,
        ...userRoutes,
        ...adminRoutes,
        ...superAdminRoutes,
        ...mechanicRoutes,

        {
            path: "/user/dashboard",
            element: <Navigate to="/user/vehicles" replace />,
        },

        {
            path: "*",
            element: <Navigate to="/login" replace />,
        },
    ];

    return useRoutes(routes);
};