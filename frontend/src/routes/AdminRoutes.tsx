import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import AdminLayout from "@/layouts/AdminLayout";
import AdminUserPage from "@/pages/admin/AdminUserpage";
import MediaManagementPage from "@/pages/admin/MediaMangements";

export const adminRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={["admin"]} />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              {
                path: "users",
                element: <AdminUserPage />,
              },
              {
                path:'media',
                element: <MediaManagementPage/>
              }
            ],
          },
        ],
      },
    ],
  },
];