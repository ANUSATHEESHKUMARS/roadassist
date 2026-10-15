import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import UserLandingPage from "@/pages/user/LandingPage";
import MyVehiclesPage from "@/components/layout/user/MyVehiclePage";
import AddVehiclePage from "@/components/layout/user/AddVehiclePage";
import EditVehiclePage from "@/components/layout/user/EditVehiclePage";
import VehicleDetailsPage from "@/pages/user/VehicleDetail";
import { UserLayout } from "@/components/layout/user/UserLayout";

export const userRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={["user"]} />,
        children: [

          {
            path: "/user",
            element: <UserLandingPage />,
          },

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
            ],
          },

        ],
      },
    ],
  },
];


