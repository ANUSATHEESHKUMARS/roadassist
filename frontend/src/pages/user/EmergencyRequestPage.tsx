
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVehicles } from "@/services/VehicleService";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import LocationPicker from "../../components/emergency/LocationPicker";
import IssueImageUpload from "../../components/emergency/IssueImageUpload";
import { CheckCircle, CarFront, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { emergencyRequestService } from "../../services/EmergencyRequestPage";

import type {
  EmergencyIssueCategory,
  EmergencyLocation,
  EmergencyVehicleOption,
} from "../../types/emergencyRequest";

const ISSUE_OPTIONS: {
  value: EmergencyIssueCategory;
  label: string;
  description: string;
}[] = [
    {
      value: "battery",
      label: "Battery problem",
      description: "Dead battery or starting issue",
    },
    {
      value: "flat_tyre",
      label: "Flat tyre",
      description: "Puncture or damaged tyre",
    },
    {
      value: "engine",
      label: "Engine problem",
      description: "Engine failure or breakdown",
    },
    {
      value: "brake",
      label: "Brake problem",
      description: "Brake failure or unusual braking",
    },
    {
      value: "electrical",
      label: "Electrical issue",
      description: "Lights, wiring, or electrical failure",
    },
    {
      value: "fuel",
      label: "Fuel problem",
      description: "Out of fuel or fuel-related issue",
    },
    {
      value: "accident",
      label: "Accident",
      description: "Vehicle damage following an accident",
    },
    {
      value: "overheating",
      label: "Overheating",
      description: "Engine temperature is too high",
    },
    {
      value: "noise",
      label: "Unusual noise",
      description: "Unexpected sounds from the vehicle",
    },
    {
      value: "other",
      label: "Other issue",
      description: "Something else needs attention",
    },
  ];

export default function EmergencyRequestPage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<EmergencyVehicleOption[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [location, setLocation] = useState<EmergencyLocation | null>(null);
  const [category, setCategory] = useState<EmergencyIssueCategory | "">("");
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
    let active = true;

    async function loadVehicles() {
      try {
        const response = await getVehicles();

        if (!active) return;

        // The API returns { vehicles: Vehicle[] } or Vehicle[] — handle both shapes
        const raw: unknown[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.vehicles)
          ? response.vehicles
          : [];

        const mapped: EmergencyVehicleOption[] = raw.map((v: any) => ({
          id: v.id ?? v._id ?? "",
          brand: v.brand ?? "",
          model: v.model ?? "",
          registratioNumber: v.registrationNumber ?? v.registratioNumber ?? "",
          vehicleType: v.vehicleType,
        }));

        setVehicles(mapped);
      } catch (error) {
        console.error("Failed to load vehicles:", error);

        if (active) {
          setPageError("Unable to load your vehicles. Please try again.");
        }
      } finally {
        if (active) {
          setLoadingVehicles(false);
        }
      }
    }

    void loadVehicles();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPageError("");
    setSuccessMessage("");

    if (!vehicleId) {
      setPageError("Please select a vehicle.");
      return;
    }

    if (!location) {
      setPageError("Please share your current location.");
      return;
    }

    if (!category) {
      setPageError("Please select an issue category.");
      return;
    }

    if (!issueTitle.trim()) {
      setPageError("Please enter a title for the issue.");
      return;
    }

    setSubmitting(true);

    try {
      const issueImages = await emergencyRequestService.uploadImages(images);

      const request = await emergencyRequestService.createRequest({
        vehicleId,
        location,
        emergencyIssueCategory: category,
        issueTitle: issueTitle.trim(),
        issueDescription: issueDescription.trim(),
        issueImages,
      });

      setSuccessMessage("Your emergency request has been created.");

      navigate(`/user/emergency-requests/${request.id ?? request._id}`, {
        replace: true,
        state: {
          status: request.status,
          message: "Your emergency request has been created.",
        },
      });
    } catch {
      setPageError(
        "We couldn't submit your emergency request. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page heading */}
        <header className="space-y-2">
          <p className="text-sm font-medium text-primary">
            ROADASSIST / EMERGENCY ASSISTANCE
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Request emergency assistance
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Tell us what's wrong with your vehicle and share your location
            so we can help you find roadside assistance.
          </p>
        </header>

        {/* Safety notice */}
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="font-medium">Before you continue</p>
          <p className="mt-1 text-sm text-muted-foreground">
            If you're in immediate danger, move to a safe place if possible.
            Do not attempt repairs in an unsafe location.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Step {currentStep} of 2
            </span>
            <span className="text-muted-foreground">
              {currentStep === 1 ? "Vehicle selection" : "Emergency details"}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full bg-primary transition-all duration-300 ${currentStep === 1 ? "w-1/2" : "w-full"
                }`}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Vehicle selection */}
          {currentStep === 1 && (
            <section className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Select your vehicle
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose the registered vehicle that needs assistance.
                </p>
              </div>

              {loadingVehicles ? (
                <p className="text-sm text-muted-foreground">
                  Loading your vehicles...
                </p>
              ) : vehicles.length === 0 ? (
                <div className="space-y-3 rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="font-medium">
                    No registered vehicles found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add a vehicle before requesting emergency assistance.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/user/vehicles/add")}
                  >
                    Add a vehicle
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {vehicles.map((vehicle) => {
                      const selected = vehicleId === vehicle.id;

                      return (
                        <button
                          key={vehicle.id}
                          type="button"
                          onClick={() => setVehicleId(vehicle.id)}
                          aria-pressed={selected}
                          className={`relative flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${selected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-muted/40"
                            }`}
                        >
                          <span
                            className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${selected
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                              }`}
                          >
                            <CarFront size={24} />                        </span>

                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold">
                              {vehicle.brand} {vehicle.model}
                            </span>

                            <span className="mt-1 block text-sm text-muted-foreground">
                              {vehicle.registratioNumber}
                            </span>

                            {vehicle.vehicleType && (
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {vehicle.vehicleType}
                              </span>
                            )}

                            <span
                              className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${selected ? "text-primary" : "text-muted-foreground"
                                }`}
                            >
                              {selected && (
                                <CheckCircle size={15} />
                              )}
                              {selected ? "Selected" : "Select vehicle"}
                            </span>
                          </span>

                          <span
                            className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border ${selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                              }`}
                          >
                            {selected && (
                              <Check size={12} />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/user")}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      disabled={!vehicleId}
                      onClick={() => {
                        setPageError("");
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Continue
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </>
              )}
            </section>
          )}

          {/* Step 2: Emergency details */}
          {currentStep === 2 && (
            <>
              {/* Selected vehicle summary */}
              <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      Selected vehicle
                    </p>

                    <p className="mt-1 font-semibold">
                      {vehicles.find((vehicle) => vehicle.id === vehicleId)?.brand}{" "}
                      {vehicles.find((vehicle) => vehicle.id === vehicleId)?.model}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {vehicles.find((vehicle) => vehicle.id === vehicleId)?.registratioNumber}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    Change
                  </Button>
                </div>
              </section>

              {/* Location */}
              <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    1. Share your location
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your coordinates will be attached to the request.
                  </p>
                </div>

                <LocationPicker
                  location={location}
                  onLocationChange={setLocation}
                />
              </section>

              {/* Issue details */}
              <section className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    2. Describe the issue
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select the closest category and explain what happened.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="issueCategory" className="text-sm font-medium">
                    Issue category <span className="text-destructive">*</span>
                  </label>

                  <select
                    id="issueCategory"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as EmergencyIssueCategory | "")
                    }
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select an issue</option>

                    {ISSUE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {category && (
                    <p className="text-sm text-muted-foreground">
                      {ISSUE_OPTIONS.find((option) => option.value === category)?.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="issueTitle" className="text-sm font-medium">
                    Issue title <span className="text-destructive">*</span>
                  </label>

                  <Input
                    id="issueTitle"
                    value={issueTitle}
                    onChange={(event) => setIssueTitle(event.target.value)}
                    placeholder="e.g. Car won't start"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="issueDescription" className="text-sm font-medium">
                    Additional details
                  </label>

                  <textarea
                    id="issueDescription"
                    value={issueDescription}
                    onChange={(event) => setIssueDescription(event.target.value)}
                    placeholder="Describe the problem, warning lights, or anything else the mechanic should know..."
                    maxLength={1000}
                    rows={4}
                    className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />

                  <p className="text-right text-xs text-muted-foreground">
                    {issueDescription.length}/1000
                  </p>
                </div>
              </section>

              {/* Images */}
              <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-semibold">
                  3. Add photos (optional)
                </h2>

                <IssueImageUpload
                  files={images}
                  onFilesChange={setImages}
                  disabled={submitting}
                />
              </section>

              {/* Errors and actions */}
              {pageError && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {pageError}
                </div>
              )}

              {successMessage && (
                <p role="status" className="text-sm text-primary">
                  {successMessage}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft size={16} />
                  Back to vehicles
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || loadingVehicles || !vehicleId}
                >
                  {submitting ? (
                    "Submitting request..."
                  ) : (
                    <>
                      Request emergency assistance
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );

}
