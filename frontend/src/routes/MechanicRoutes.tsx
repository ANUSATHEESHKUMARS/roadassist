import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";
import MechanicApplicationStatusPage from "@/pages/mechanic/MechanicApplicationStatusPage";
import MechanicOnboardingPage from "@/pages/mechanic/mechanicOnboardingPage";

export const mechanicRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={["mechanic", "user"]} />,
        children: [
          // Both users (who submitted an application) and mechanics can view this
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
            path: "/mechanic/dashboard",
            element: <MechanicApplicationStatusPage />,
          },
        ],
      },
    ],
  },
];
