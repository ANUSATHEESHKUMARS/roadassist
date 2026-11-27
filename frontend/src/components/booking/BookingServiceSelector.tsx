import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mechanicCategoryService } from "@/services/admin/mechanicCategoryService";

const STANDARD_SERVICES = [
  "Engine Repair",
  "Battery Jumpstart",
  "Puncture Repair",
  "Brake Service",
  "Electrical Diagnostics",
  "Periodic Maintenance",
  "AC & Cooling Service",
  "Clutch & Transmission",
  "EV Battery Diagnostics",
];

interface BookingServiceSelectorProps {
  serviceType: string;
  onSelect: (serviceType: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function BookingServiceSelector({
  serviceType,
  onSelect,
  onBack,
  onContinue,
}: BookingServiceSelectorProps) {
  const [availableServices, setAvailableServices] =
    useState<string[]>(STANDARD_SERVICES);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const categories = await mechanicCategoryService.getAll(false);
        if (cancelled || !Array.isArray(categories) || categories.length === 0) {
          return;
        }

        const dynamicNames: string[] = [];
        for (const cat of categories) {
          if (cat.isActive && cat.name?.trim()) {
            dynamicNames.push(cat.name.trim());
          }
          for (const sub of cat.subcategories ?? []) {
            if (sub.isActive && sub.name?.trim()) {
              dynamicNames.push(sub.name.trim());
            }
          }
        }

        if (dynamicNames.length > 0) {
          const merged = Array.from(
            new Set([...dynamicNames, ...STANDARD_SERVICES])
          );
          setAvailableServices(merged);
        }
      } catch {
        // Fallback silently to standard services if category endpoint is unavailable
      }
    };

    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleContinue = () => {
    if (!serviceType.trim()) {
      setValidationError("Please select or enter a service type to proceed.");
      return;
    }
    setValidationError("");
    onContinue();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Step 2: Select Required Service
        </h2>
        <p className="text-xs text-muted-foreground">
          Choose the service you need so we only match certified mechanics who
          offer it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableServices.map((service) => {
          const isSelected = serviceType === service;

          return (
            <button
              key={service}
              type="button"
              onClick={() => {
                setValidationError("");
                onSelect(service);
              }}
              className={`rounded-xl border p-4 text-left transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Wrench className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold truncate">{service}</span>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <Label
          htmlFor="customServiceType"
          className="text-xs font-medium text-foreground"
        >
          Or enter an exact service name
        </Label>
        <Input
          id="customServiceType"
          value={serviceType}
          onChange={(e) => {
            setValidationError("");
            onSelect(e.target.value);
          }}
          placeholder="e.g. Engine Repair, puncture repair, battery assistance"
          className="h-10 bg-input border-border text-xs"
        />
        <p className="text-[11px] text-muted-foreground">
          Service matching checks against each mechanic&apos;s listed{" "}
          <span className="font-mono text-foreground">serviceOffered</span>.
        </p>
      </div>

      {validationError && (
        <p role="alert" className="text-xs text-destructive">
          {validationError}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>

        <Button
          type="button"
          onClick={handleContinue}
          disabled={!serviceType.trim()}
        >
          Continue to Location
        </Button>
      </div>
    </div>
  );
}

