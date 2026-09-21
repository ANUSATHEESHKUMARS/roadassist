import React from "react";
import { ArrowRight, Fuel, Calendar, Car } from "lucide-react";

import type { Vehicle } from "@/types/user/vehicle";
import { VehicleStatusBadge } from "./VehicleStatusBadge";

interface VehicleCardProps {
  vehicle: Vehicle;
  onViewDetails?: (id: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onViewDetails,
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      
      {/* Vehicle Image */}
      <div className="relative h-44 w-full bg-muted overflow-hidden">
        {vehicle.vehicleImage ? (
          <img
            src={vehicle.vehicleImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <Car className="h-12 w-12 stroke-[1.2]" />
          </div>
        )}

        {/* Status Badge */}
        {vehicle.status && (
          <div className="absolute top-3.5 left-3.5">
            <VehicleStatusBadge status={vehicle.status} />
          </div>
        )}
      </div>

      {/* Vehicle Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">

        {/* Vehicle Name */}
        <div>
          <h3 className="text-base font-bold text-card-foreground tracking-tight leading-snug">
            {vehicle.brand} {vehicle.model}
          </h3>

          {/* Registration Number */}
          <p className="text-xs font-mono font-medium text-muted-foreground mt-1">
            Reg:{" "}
            <span className="text-card-foreground font-semibold">
              {vehicle.registrationNumber}
            </span>
          </p>
        </div>

        {/* Specifications */}
        <div className="pt-4 border-t border-border mt-4">

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">

            {/* Fuel */}
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
              {vehicle.fuelType}
            </span>

            {/* Year */}
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {vehicle.year}
            </span>

          </div>

          {/* View Details */}
          <button
            type="button"
            onClick={() => onViewDetails?.(vehicle.id)}
            className="
              w-full
              h-10
              rounded-xl
              bg-primary
              hover:bg-primary/90
              text-primary-foreground
              text-xs
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition-colors
              cursor-pointer
              shadow-sm
            "
          >
            <span>View Details</span>

            <ArrowRight className="h-3.5 w-3.5" />
          </button>

        </div>
      </div>
    </div>
  );
};