import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import UserLandingPage from "@/pages/user/LandingPage";

import MyVehiclesPage from "@/components/layout/user/MyVehiclePage";
import AddVehiclePage from "@/components/layout/user/AddVehiclePage";
import { UserLayout } from "@/components/layout/user/UserLayout";

import { Navigate, Route, Routes } from "react-router-dom";
import VehicleDetailsPage from "@/pages/user/VehicleDetail";
import EditVehiclePage from "@/components/layout/user/EditVehiclePage";

export const AppRoutes = () => {
  return (
    <Routes>

      {/* Authentication */}
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />

      {/* User Landing */}
      <Route path="/user" element={<UserLandingPage />} />

      {/* User Application Layout */}
      <Route path="/user" element={<UserLayout />}>

        <Route
          path="vehicles"
          element={<MyVehiclesPage />}
        />

        <Route
          path="vehicles/add"
          element={<AddVehiclePage />}
        />

      </Route>


      <Route
          path="vehicles/:vehicleId"
          element={<VehicleDetailsPage />}
        />

        <Route path="vehicles/:vehicleId/edit" element={<EditVehiclePage/>}/>

      {/* Old dashboard URL */}
      <Route
        path="/user/dashboard"
        element={
          <Navigate
            to="/user/vehicles"
            replace
          />
        }
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={
          <Navigate
            to="/user/vehicles"
            replace
          />
        }
      />

    </Routes>
  );
};