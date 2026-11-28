import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import MechanicOnboardingPage from "@/pages/mechanic/mechanicOnboardingPage";
import MechanicDashboardPage from "@/pages/mechanic/MechanicDashboardPage";
import MechanicServiceRequestsPage from "@/pages/mechanic/MechanicServiceRequestsPage";
import MechanicAcceptedRequestPage from "@/pages/mechanic/MechanicAcceptedRequestPage";
import { MechanicLayout } from "@/components/mechanic/MechanicLayout";
import { MechanicSchedulePage } from "@/pages/mechanic/MechanicScedulePage";
import { MechanicScheduleSuccessPage } from "@/pages/mechanic/MechanicScheduleSuccessPage";
import { MechanicServiceLocationPage } from "@/pages/mechanic/MechanicServiceLocation";
import MechanicBookingsPage from "@/pages/mechanic/MechanicBookingsPage";
import MechanicBookingDetailsPage from "@/pages/mechanic/MechanicBookingDetailsPage";


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
                            {
                                path:"/mechanic/schedule",
                                element:<MechanicSchedulePage/>
                            },
                            {
                                path:"/mechanic/schedule/success",
                                element:<MechanicScheduleSuccessPage/>
                            },
                            {
                                path:"/mechanic/bookings",
                                element:<MechanicBookingsPage/>
                            },
                            {
                                path:"/mechanic/bookings/:bookingId",
                                element:<MechanicBookingDetailsPage/>
                            },
                            {
                                path:"/mechanic/service-location",
                                element:<MechanicServiceLocationPage/>
                            }
                        ],
                    },
                ],
            },
        ],
    },
];

