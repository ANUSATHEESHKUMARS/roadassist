import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import MechanicOnboardingPage from "@/pages/mechanic/mechanicOnboardingPage";
import MechanicDashboardPage from "@/pages/mechanic/MechanicDashboardPage";
import MechanicServiceRequestsPage from "@/pages/mechanic/MechanicServiceRequestsPage";
import { MechanicLayout } from "@/components/mechanic/MechanicLayout";


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

            // Only approved mechanics can access mechanic pages
            {
                element: <RoleRoute allowedRoles={["mechanic"]} />,
                children: [
                    {
                        element: <MechanicLayout />,
                        children: [
                            {
                                path: "/mechanic/dashboard",
                                element: <MechanicDashboardPage />,
                            },
                            {
                                path: "/mechanic/service-requests",
                                element: <MechanicServiceRequestsPage />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];