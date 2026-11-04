
import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import MechanicApplicationStatusPage from "@/pages/mechanic/MechanicApplicationStatusPage";
import MechanicOnboardingPage from "@/pages/mechanic/mechanicOnboardingPage";

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
                        element: <MechanicApplicationStatusPage />,
                    },
                ],
            },
        ],
    },
];
