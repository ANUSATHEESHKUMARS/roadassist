import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import AdminManagementPage from "@/pages/superAdmin/AdminMangementPage";

export const superAdminRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={["superadmin"]} />,
        children: [
          {
            path: "/superadmin",
            element: <SuperAdminLayout />,
            children: [
              {
                path: "admins",
                element: <AdminManagementPage />,
              },
            ],
          },
        ],
      },
    ],
  },
];