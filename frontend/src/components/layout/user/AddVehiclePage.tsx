import React from "react";
import { Breadcrumb } from "@/components/layout/user/Breadcrumb";
import { VehicleForm } from "@/components/vehicle/VehicleForm";

export default function AddVehiclePage() {
  return (
    <div className="space-y-6 bg-background text-foreground">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "My Vehicles", href: "/user/vehicles" },
          { label: "Add Vehicle" },
        ]}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Add New Vehicle
        </h1>

        <p className="text-xs text-muted-foreground mt-1">
          Enroll a new car, motorcycle, or fleet unit to enable instant
          roadside dispatch.
        </p>
      </div>

      {/* Vehicle Form */}
      <VehicleForm />
    </div>
  );
}