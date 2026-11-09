import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import MechanicOnboardingPage from "@/pages/mechanic/mechanicOnboardingPage";
import MechanicDashboardPage from "@/pages/mechanic/MechanicDashboardPage";
import MechanicServiceRequestsPage from "@/pages/mechanic/MechanicServiceRequestsPage";
import MechanicAcceptedRequestPage from "@/pages/mechanic/MechanicAcceptedRequestPage";
import { MechanicLayout } from "@/components/mechanic/MechanicLayout";


export const mechanicRoutes: RouteObject[] = [
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <RoleRoute allowedRoles={["user", "mechanic"]} />,
                children: [
                    {
                        path: "/mechanic/onboarding",
                        element: <MechanicOnboardingPage />,
                    },
                ],
            },

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
                            {
                                path: "/mechanic/emergency-requests/:requestId",
                                element: <MechanicAcceptedRequestPage />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

