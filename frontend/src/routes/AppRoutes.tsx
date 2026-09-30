import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOtp from "@/pages/auth/VerifyOtp";

import UserLandingPage from "@/pages/user/LandingPage";
import MyVehiclesPage from "@/components/layout/user/MyVehiclePage";
import AddVehiclePage from "@/components/layout/user/AddVehiclePage";
import EditVehiclePage from "@/components/layout/user/EditVehiclePage";
import VehicleDetailsPage from "@/pages/user/VehicleDetail";
import { UserLayout } from "@/components/layout/user/UserLayout";

import AdminUserPage from "@/pages/admin/AdminUserpage";
import AdminLayout from "@/layouts/AdminLayout";

import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import AdminManagementPage from "@/pages/superAdmin/AdminMangementPage";

import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import { Navigate, Route, Routes } from "react-router-dom";
import PublicRoute from "./PublicRoutes";


export const AppRoutes = () => {

  return (
    <Routes>

      {/* ==================== */}
      {/* PUBLIC ROUTES        */}
      {/* ==================== */}
<Route element={<PublicRoute />}>
    <Route path="/register" element={<Register />} />
    <Route path="/verify-otp" element={<VerifyOtp />} />
    <Route path="/login" element={<Login />} />
</Route>

      {/* ==================== */}
      {/* USER ROUTES           */}
      {/* ==================== */}

      <Route
        element={<ProtectedRoute />}
      >
        <Route
          element={
            <RoleRoute
              allowedRoles={["user"]}
            />
          }
        >

          <Route
            path="/user"
            element={<UserLayout />}
          >

            {/* /user */}
            <Route
              index
              element={<UserLandingPage />}
            />

            {/* /user/vehicles */}
            <Route
              path="vehicles"
              element={<MyVehiclesPage />}
            />

            {/* /user/vehicles/add */}
            <Route
              path="vehicles/add"
              element={<AddVehiclePage />}
            />

            {/* /user/vehicles/:vehicleId */}
            <Route
              path="vehicles/:vehicleId"
              element={<VehicleDetailsPage />}
            />

            {/* /user/vehicles/:vehicleId/edit */}
            <Route
              path="vehicles/:vehicleId/edit"
              element={<EditVehiclePage />}
            />

          </Route>

        </Route>
      </Route>


      {/* ==================== */}
      {/* ADMIN ROUTES         */}
      {/* ==================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>

          <Route path="/admin" element={<AdminLayout />}>
            <Route
              path="users"
              element={<AdminUserPage />}
            />
          </Route>

        </Route>
      </Route>


      {/* ==================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["superadmin"]} />}>

          <Route
            path="/superadmin"
            element={<SuperAdminLayout />}
          >
            <Route
              path="admins"
              element={<AdminManagementPage />}
            />
          </Route>

        </Route>
      </Route>

      {/* ==================== */}
      {/* OLD DASHBOARD URL    */}
      {/* ==================== */}

      <Route
        path="/user/dashboard"
        element={
          <Navigate
            to="/user/vehicles"
            replace
          />
        }
      />


      {/* ==================== */}
      {/* UNKNOWN ROUTES       */}
      {/* ==================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
};