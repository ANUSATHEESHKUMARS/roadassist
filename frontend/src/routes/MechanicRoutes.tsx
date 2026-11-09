
import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import MechanicOnboardingPage from "@/pages/mechanic/mechanicOnboardingPage";
import MechanicDashboardPage from "@/pages/mechanic/MechanicDashboardPage";

export const mechanicRoutes: RouteObject[] = [
    {
        element: <ProtectedRoute />,
        children: [
            // Users and mechanics can access onboarding
            {
                element: <RoleRoute allowedRoles={["user", "mechanic"]} />,
                children: [
                    {
                        path: "/mechanic/onboarding",
                        element: <MechanicOnboardingPage />,
                    },
                ],
            },

            // Only approved mechanics can access their dashboard
            {
                element: <RoleRoute allowedRoles={["mechanic"]} />,
                children: [
                    {
                        path: "/mechanic/dashboard",
                        element: <MechanicDashboardPage />,
                    },
                ],
            },
        ],
    },
];
