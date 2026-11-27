import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  Calendar,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MechanicCard } from "@/components/booking/MechanicCard";
import type {
  DiscoveredMechanicItem,
  DiscoverMechanicsResponse,
} from "@/types/user/scheduledBooking";

type SortMode = "distance" | "experience";

interface MechanicDiscoveryListProps {
  discoveryResult: DiscoverMechanicsResponse | null;
  selectedMechanic: DiscoveredMechanicItem | null;
  isDiscovering: boolean;
  isReserving: boolean;
  error: string | null;
  onSelectMechanic: (mechanic: DiscoveredMechanicItem) => void;
  onChangeSchedule: () => void;
  onChangeLocation: () => void;
  onRetryDiscover: () => void;
  onConfirmReservation: () => void;
}

export function MechanicDiscoveryList({
  discoveryResult,
  selectedMechanic,
  isDiscovering,
  isReserving,
  error,
  onSelectMechanic,
  onChangeSchedule,
  onChangeLocation,
  onRetryDiscover,
  onConfirmReservation,
}: MechanicDiscoveryListProps) {
  const [sortBy, setSortBy] = useState<SortMode>("distance");

  const sortedMechanics = useMemo(() => {
    const list = discoveryResult?.mechanics ?? [];
    return [...list].sort((a, b) => {
      if (sortBy === "experience") {
        return (b.experienceYears ?? 0) - (a.experienceYears ?? 0);
      }
      return a.distanceKm - b.distanceKm;
    });
  }, [discoveryResult, sortBy]);

  if (isDiscovering) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 animate-pulse space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-5 w-44 rounded bg-muted" />
              <div className="h-5 w-24 rounded-full bg-muted" />
            </div>
            <div className="h-4 w-64 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Step 5: Choose an Available Mechanic
          </h2>
          <p className="text-xs text-muted-foreground">
            Showing verified mechanics within service radius for your vehicle,
            service, date, and shift.
          </p>
        </div>

        {sortedMechanics.length > 0 && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setSortBy("distance")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                sortBy === "distance"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Nearest First
            </button>
            <button
              type="button"
              onClick={() => setSortBy("experience")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                sortBy === "experience"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Most Experienced
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetryDiscover}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        </div>
      )}

      {!error && sortedMechanics.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                No mechanics available for this slot
              </h3>
              <p className="text-xs text-muted-foreground">
                No certified mechanics match this vehicle, service, location
                radius, date, and shift. Try selecting a different date, shift,
                or nearby address.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onChangeSchedule}
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Change Date / Shift
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onChangeLocation}
              >
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                Change Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sortedMechanics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedMechanics.map((mechanic) => (
            <MechanicCard
              key={mechanic.mechanicId}
              mechanic={mechanic}
              isSelected={selectedMechanic?.mechanicId === mechanic.mechanicId}
              onSelect={onSelectMechanic}
            />
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onChangeSchedule}
          disabled={isReserving}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Date & Shift
        </Button>

        {sortedMechanics.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Booking fee:{" "}
              <span className="font-bold text-foreground">
                ₹{discoveryResult?.bookingAmount ?? 800}
              </span>
            </p>
            <Button
              type="button"
              onClick={onConfirmReservation}
              disabled={!selectedMechanic || isReserving}
            >
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              {isReserving
                ? "Reserving Slot..."
                : "Reserve Slot & Proceed to Payment"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

