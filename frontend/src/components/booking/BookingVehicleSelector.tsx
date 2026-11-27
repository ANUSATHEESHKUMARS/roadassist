import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Fuel,
  Plus,
  RefreshCw,
} from "lucide-react";
import { getApiErrorMessage } from "@/api/apiError";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getVehicles } from "@/services/VehicleService";
import type { Vehicle } from "@/types/user/vehicle";

interface BookingVehicleSelectorProps {
  selectedVehicle: Vehicle | null;
  onSelect: (vehicle: Vehicle) => void;
  onContinue: () => void;
}

export function BookingVehicleSelector({
  selectedVehicle,
  onSelect,
  onContinue,
}: BookingVehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadVehicles = async () => {
      try {
        const response = await getVehicles();
        if (!cancelled) {
          const list = Array.isArray(response?.vehicles)
            ? response.vehicles
            : [];
          setVehicles(list);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadVehicles();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRefreshTick((t) => t + 1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4 animate-pulse space-y-3"
          >
            <div className="h-32 w-full rounded-xl bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-card">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Failed to load your vehicles
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (vehicles.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
            <Car className="h-6 w-6" />
          </div>
          <div className="max-w-sm space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              No vehicles registered yet
            </h3>
            <p className="text-xs text-muted-foreground">
              Please add a vehicle to your garage before booking a scheduled
              service.
            </p>
          </div>
          <Link to="/user/vehicles/add">
            <Button type="button" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Vehicle
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Step 1: Select Your Vehicle
          </h2>
          <p className="text-xs text-muted-foreground">
            Choose which vehicle requires scheduled mechanic assistance.
          </p>
        </div>

        <Link to="/user/vehicles/add">
          <Button type="button" variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => {
          const isSelected = selectedVehicle?.id === vehicle.id;

          return (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => onSelect(vehicle)}
              className={`rounded-2xl border overflow-hidden text-left transition-all cursor-pointer flex flex-col ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="relative h-36 w-full bg-muted overflow-hidden">
                {vehicle.vehicleImage ? (
                  <img
                    src={vehicle.vehicleImage}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Car className="h-10 w-10 stroke-[1.3]" />
                  </div>
                )}

                {isSelected && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Selected
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2 flex-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    {vehicle.registrationNumber}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                  <span className="uppercase font-semibold text-foreground/90">
                    {vehicle.vehicleType}
                  </span>
                  <span className="inline-flex items-center gap-1 capitalize">
                    <Fuel className="h-3.5 w-3.5" />
                    {vehicle.fuelType}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={onContinue}
          disabled={!selectedVehicle}
        >
          Continue to Service Selection
        </Button>
      </div>
    </div>
  );
}

