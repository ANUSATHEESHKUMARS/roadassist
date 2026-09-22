import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components/layout/user/Breadcrumb";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { AddVehicleCard } from "@/components/vehicle/AddVehicleCard";

import { getVehicles } from "@/services/authService";
import type { Vehicle } from "@/types/user/vehicle";

export default function MyVehiclesPage() {

  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const handleViewDetails = (id: string): void => {
    console.log('cliked the handle navigation')
    navigate(`/vehicles/${id}`)
  };

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getVehicles();

      console.log("Vehicles response:", response);

      setVehicles(response.vehicles);
      console.log("FIRST VEHICLE:", response.vehicles[0]);

    } catch (error: any) {
  console.error("FAILED TO FETCH VEHICLES");
  console.error("STATUS:", error.response?.status);
  console.error("DATA:", error.response?.data);
  console.error("MESSAGE:", error.message);
  console.error("FULL ERROR:", error);
} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="min-h-full bg-background text-foreground space-y-6">

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            label: "My Vehicles",
          },
        ]}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My Vehicles
        </h1>

        <p className="text-xs text-muted-foreground mt-1">
          Review your enrolled vehicles and manage your vehicle details.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-sm text-muted-foreground">
          Loading vehicles...
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="text-sm text-primary">
          {error}
        </div>
      )}

      {/* Vehicles */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onViewDetails={handleViewDetails}
            />
          ))}

          {/* Add New Vehicle */}
          <AddVehicleCard to="/user/vehicles/add" />

        </div>
      )}

    </div>
  );
}


