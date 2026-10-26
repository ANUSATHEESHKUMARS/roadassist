
import React from "react";
import { Briefcase, Car, Building2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  MechanicOnboardingRequest,
  MechanicType,
  VehicleSpecialization,
} from "@/types/mechanic/mechanicOnboarding";

interface ProfessionalProps {
  data: MechanicOnboardingRequest;
  onChange: (fields: Partial<MechanicOnboardingRequest>) => void;
  errors: Record<string, string>;
}

const VEHICLE_SPECIALIZATIONS: {
  key: VehicleSpecialization;
  label: string;
}[] = [
  { key: "car", label: "Cars & SUVs" },
  { key: "bike", label: "Motorcycles & Bikes" },
  { key: "auto", label: "Auto Rickshaws" },
  { key: "ev", label: "Electric Vehicles (EV)" },
];

const SERVICE_MODELS: {
  type: MechanicType;
  title: string;
  description: string;
}[] = [
  {
    type: "mobile",
    title: "Mobile Mechanic",
    description: "Travel to the customer's breakdown location.",
  },
  {
    type: "workshop",
    title: "Workshop Mechanic",
    description: "Provide services at your workshop or garage.",
  },
  {
    type: "both",
    title: "Both",
    description: "Provide mobile assistance and workshop services.",
  },
];

export const MechanicProfessionalDetailsForm: React.FC<
  ProfessionalProps
> = ({ data, onChange, errors }) => {
  const toggleVehicleType = (vehicle: VehicleSpecialization) => {
    const current = data.supportedVehicleTypes ?? [];

    const updated = current.includes(vehicle)
      ? current.filter((item) => item !== vehicle)
      : [...current, vehicle];

    // Supported vehicles and professional specializations
    // are separate fields.
    onChange({
      supportedVehicleTypes: updated,
    });
  };

  const updateWorkshop = (
    field: "workshopName" | "workshopAddress",
    value: string
  ) => {
    onChange({ [field]: value });
  };

  const updateSpecializations = (value: string) => {
    const specialization = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    onChange({ specialization });
  };

  const updateServices = (value: string) => {
    const serviceOffered = value
      .split(",")
      .map((service) => service.trim())
      .filter(Boolean);

    onChange({ serviceOffered });
  };

  const selectedModel = data.serviceModel;

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-base font-bold text-foreground">
          Professional Details
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Tell us about your experience, supported vehicles, and
          service capabilities.
        </p>
      </div>

      {/* Service Model */}
      <section className="space-y-2">
        <Label className="text-xs font-medium text-foreground">
          Service Model *
        </Label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SERVICE_MODELS.map((item) => {
            const selected = selectedModel === item.type;

            return (
              <button
                key={item.type}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ serviceModel: item.type })}
                className={`rounded-xl border p-3.5 text-left transition-colors ${
                  selected
                    ? "bg-primary/10 border-primary ring-1 ring-primary"
                    : "bg-input/60 border-border hover:bg-input"
                }`}
              >
                <span className="block text-xs font-bold text-foreground">
                  {item.title}
                </span>

                <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Experience */}
      <section className="max-w-xs space-y-1.5">
        <Label
          htmlFor="experienceYears"
          className="flex items-center gap-1.5 text-xs font-medium text-foreground"
        >
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
          Years of Experience *
        </Label>

        <Input
          id="experienceYears"
          type="number"
          min={0}
          max={60}
          step={1}
          value={data.experienceYears}
          onChange={(event) => {
            const value = event.target.value;

            onChange({
              experienceYears: value === "" ? 0: Number(value),
            });
          }}
          aria-invalid={Boolean(errors.experienceYears)}
          className={`h-11 border-border bg-input text-xs text-foreground ${
            errors.experienceYears
              ? "border-destructive ring-1 ring-destructive"
              : ""
          }`}
        />

        {errors.experienceYears && (
          <p className="text-[11px] text-destructive">
            {errors.experienceYears}
          </p>
        )}
      </section>

      {/* Supported Vehicle Types */}
      <section className="space-y-2">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Car className="h-3.5 w-3.5 text-muted-foreground" />
          Supported Vehicle Types *
        </Label>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {VEHICLE_SPECIALIZATIONS.map((vehicle) => {
            const selected =
              data.supportedVehicleTypes?.includes(vehicle.key) ?? false;

            return (
              <button
                key={vehicle.key}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleVehicleType(vehicle.key)}
                className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                  selected
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-input/40 border-border text-muted-foreground hover:bg-input"
                }`}
              >
                <span className="text-xs font-medium">
                  {vehicle.label}
                </span>

                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    selected
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {selected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {errors.supportedVehicleTypes && (
          <p className="text-[11px] text-destructive">
            {errors.supportedVehicleTypes}
          </p>
        )}
      </section>

      {/* Professional Specializations */}
      <section className="space-y-1.5">
        <Label
          htmlFor="specialization"
          className="text-xs font-medium text-foreground"
        >
          Specializations *
        </Label>

        <Input
          id="specialization"
          value={(data.specialization ?? []).join(", ")}
          onChange={(event) =>
            updateSpecializations(event.target.value)
          }
          placeholder="e.g. engine repair, electrical diagnostics"
          aria-invalid={Boolean(errors.specialization)}
          className={`h-11 border-border bg-input text-xs text-foreground ${
            errors.specialization
              ? "border-destructive ring-1 ring-destructive"
              : ""
          }`}
        />

        <p className="text-[11px] text-muted-foreground">
          Enter your professional skills separated by commas.
        </p>

        {errors.specialization && (
          <p className="text-[11px] text-destructive">
            {errors.specialization}
          </p>
        )}
      </section>

      {/* Services Offered */}
      <section className="space-y-1.5">
        <Label
          htmlFor="serviceOffered"
          className="text-xs font-medium text-foreground"
        >
          Services Offered *
        </Label>

        <Input
          id="serviceOffered"
          value={(data.serviceOffered ?? []).join(", ")}
          onChange={(event) => updateServices(event.target.value)}
          placeholder="e.g. puncture repair, battery assistance"
          aria-invalid={Boolean(errors.serviceOffered)}
          className={`h-11 border-border bg-input text-xs text-foreground ${
            errors.serviceOffered
              ? "border-destructive ring-1 ring-destructive"
              : ""
          }`}
        />

        {errors.serviceOffered && (
          <p className="text-[11px] text-destructive">
            {errors.serviceOffered}
          </p>
        )}
      </section>

      {/* Conditional Workshop Details */}
      {(selectedModel === "workshop" || selectedModel === "both") && (
        <section className="space-y-4 rounded-xl border border-border bg-secondary p-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Building2 className="h-4 w-4 text-primary" />

            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Workshop Details
            </h4>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="workshopName"
              className="text-xs text-foreground"
            >
              Workshop Name *
            </Label>

            <Input
              id="workshopName"
              value={data.workshopName ?? ""}
              onChange={(event) =>
                updateWorkshop("workshopName", event.target.value)
              }
              placeholder="Enter workshop name"
              aria-invalid={Boolean(errors.workshopName)}
              className="h-10 border-border bg-input text-xs text-foreground"
            />

            {errors.workshopName && (
              <p className="text-[11px] text-destructive">
                {errors.workshopName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="workshopAddress"
              className="text-xs text-foreground"
            >
              Workshop Address *
            </Label>

            <Input
              id="workshopAddress"
              value={data.workshopAddress ?? ""}
              onChange={(event) =>
                updateWorkshop("workshopAddress", event.target.value)
              }
              placeholder="Enter full workshop address"
              aria-invalid={Boolean(errors.workshopAddress)}
              className="h-10 border-border bg-input text-xs text-foreground"
            />

            {errors.workshopAddress && (
              <p className="text-[11px] text-destructive">
                {errors.workshopAddress}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
  