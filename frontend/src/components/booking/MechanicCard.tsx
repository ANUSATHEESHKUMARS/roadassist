import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Wrench,
} from "lucide-react";
import type { DiscoveredMechanicItem } from "@/types/user/scheduledBooking";

const SERVICE_MODEL_LABELS: Record<string, string> = {
  mobile: "Mobile Service",
  workshop: "Workshop Service",
  both: "Mobile & Workshop",
};

interface MechanicCardProps {
  mechanic: DiscoveredMechanicItem;
  isSelected: boolean;
  onSelect: (mechanic: DiscoveredMechanicItem) => void;
}

export function MechanicCard({
  mechanic,
  isSelected,
  onSelect,
}: MechanicCardProps) {
  const initials = mechanic.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={() => onSelect(mechanic)}
      className={`w-full rounded-2xl border p-5 text-left transition-all cursor-pointer space-y-4 ${
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground shrink-0">
            {initials || "M"}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate">
              {mechanic.fullName}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
              {mechanic.experienceYears !== undefined && (
                <span>{mechanic.experienceYears} yrs experience</span>
              )}
              {mechanic.serviceModel && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
                  <Wrench className="h-3 w-3 text-primary" />
                  {SERVICE_MODEL_LABELS[mechanic.serviceModel] ??
                    mechanic.serviceModel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <Navigation className="h-3 w-3" />
            {mechanic.distanceKm.toFixed(1)} km away
          </span>
          {isSelected && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Selected
            </span>
          )}
        </div>
      </div>

      {/* Location & Workshop Info */}
      <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
        {mechanic.workshopName && (
          <p className="flex items-center gap-2 text-foreground font-medium">
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{mechanic.workshopName}</span>
          </p>
        )}

        {(mechanic.workshopAddress || mechanic.serviceAddress) && (
          <p className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{mechanic.workshopAddress ?? mechanic.serviceAddress}</span>
          </p>
        )}

        <p className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            Morning {mechanic.morningStartTime}–{mechanic.morningEndTime} ·
            Afternoon {mechanic.afternoonStartTime}–{mechanic.afternoonEndTime}{" "}
            IST
          </span>
        </p>
      </div>
    </button>
  );
}

