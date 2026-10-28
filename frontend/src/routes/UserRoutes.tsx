import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import UserLandingPage from "@/pages/user/LandingPage";
import MyVehiclesPage from "@/components/layout/user/MyVehiclePage";
import AddVehiclePage from "@/components/layout/user/AddVehiclePage";
import EditVehiclePage from "@/components/layout/user/EditVehiclePage";
import VehicleDetailsPage from "@/pages/user/VehicleDetail";
import { UserLayout } from "@/components/layout/user/UserLayout";
import MechanicApplicationStatusPage from "@/pages/mechanic/MechanicApplicationStatusPage";
import EmergencyRequestPage from "@/pages/user/EmergencyRequestPage";
import MechanicOnboardingPage from "@/pages/mechanic/mechanicOnboardingPage";

export const userRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={["user"]} />,
        children: [
          // Standalone landing/home page at /user (no sidebar layout)
          {
            path: "/user",
            element: <UserLandingPage />,
          },

          // Sub-pages wrapped in the sidebar/header UserLayout
          {
            path: "/user",
            element: <UserLayout />,
            children: [
              {
                path: "vehicles",
                element: <MyVehiclesPage />,
              },
              {
                path: "vehicles/add",
                element: <AddVehiclePage />,
              },
              {
                path: "vehicles/:vehicleId",
                element: <VehicleDetailsPage />,
              },
              {
                path: "vehicles/:vehicleId/edit",
                element: <EditVehiclePage />,
              },
              {
                path: "mechanic-application",
                element: <MechanicApplicationStatusPage />,
              },
              
            ],
          },
           {
            path: "/mechanic/onboarding",
            element: <MechanicOnboardingPage />,
          },{
            path :"/user/emergency",
            element:<EmergencyRequestPage/>
          }

        ],
      },
    ],
  },
];
