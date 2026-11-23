import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import AdminLayout from "@/layouts/AdminLayout";
import AdminUserPage from "@/pages/admin/AdminUserpage";
import MediaManagementPage from "@/pages/admin/MediaMangements";

import MechanicApplicationsPage from "@/pages/admin/AdminMechanicpage";
import MechanicCategoryPage from "@/pages/admin/MechanicCategoryPage";
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
                path: 'media',
                element: <MediaManagementPage />

              },
              {
                path: "mechanics",
                element: <MechanicApplicationsPage />
              },
              {
                path:"mechanic-categories",
                element:<MechanicCategoryPage/>
              }
            ],
          },
        ],
      },
    ],
  },
];