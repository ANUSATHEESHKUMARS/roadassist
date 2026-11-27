import { useMemo, useState } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Breadcrumb } from "@/components/layout/user/Breadcrumb";
import LocationPicker from "@/components/emergency/LocationPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useScheduledBooking } from "@/hooks/useScheduledBooking";
import { useAuthStore } from "@/store/authStore";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { BOOKING_STEPS } from "@/types/user/scheduledBooking";
import { BookingVehicleSelector } from "@/components/booking/BookingVehicleSelector";
import { BookingServiceSelector } from "@/components/booking/BookingServiceSelector";
import { BookingDateShiftSelector } from "@/components/booking/BookingDateShiftSelector";
import { MechanicDiscoveryList } from "@/components/booking/MechanicDiscoveryList";
import { BookingPaymentStep } from "@/components/booking/BookingPaymentStep";
import { BookingConfirmationView } from "@/components/booking/BookingConfirmationView";
import type { EmergencyLocation } from "@/types/emergencyRequest";

export default function ScheduledBookingPage() {
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();

  const {
    state,
    remainingSeconds,
    isReservationExpired,
    isDiscovering,
    isReserving,
    isRecoveringStatus,
    error,
    clearError,
    setStep,
    selectVehicle,
    setServiceType,
    setProblemDescription,
    setLocation,
    setScheduledDate,
    setSlot,
    selectMechanic,
    resetReservation,
    discoverMechanics,
    createReservation,
    initiatePayment,
    recoverBookingStatus,
  } = useScheduledBooking();

  const [locationValidationError, setLocationValidationError] = useState("");

  const maxReachedIndex = useMemo(() => {
    const idx = BOOKING_STEPS.findIndex((s) => s.id === state.step);
    return idx >= 0 ? idx : 0;
  }, [state.step]);

  const handleLocationPickerChange = (loc: EmergencyLocation | null) => {
    setLocationValidationError("");
    if (!loc) {
      setLocation(null);
      return;
    }

    setLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address ?? state.location?.address ?? "",
    });
  };

  const handleLocationContinue = () => {
    if (!state.location) {
      setLocationValidationError(
        "Please capture your GPS location or search an address on the map."
      );
      return;
    }

    if (!state.location.address.trim()) {
      setLocationValidationError(
        "Please enter a readable service address for the mechanic."
      );
      return;
    }

    setLocationValidationError("");
    setStep("schedule");
  };

  const handleDiscover = async () => {
    const res = await discoverMechanics();
    if (!res) {
      showToast("Unable to find mechanics with the selected details.", "error");
    }
  };

  const handleConfirmReservation = async () => {
    const reservation = await createReservation();
    if (reservation) {
      showToast(
        "Slot temporarily reserved. Complete payment before the timer expires.",
        "success"
      );
    }
  };

  const handlePayNow = async () => {
    await initiatePayment({
      ...(user?.fullName ? { name: user.fullName } : {}),
      ...(user?.email ? { email: user.email } : {}),
    });
  };

  const handleCheckRecovery = async () => {
    const recovered = await recoverBookingStatus();
    if (recovered?.status.status === "confirmed") {
      showToast("Booking confirmed!", "success");
    } else if (recovered?.status.status === "expired") {
      showToast("Reservation expired. Please search mechanics again.", "error");
    } else if (recovered) {
      showToast(`Current booking status: ${recovered.status.status}`, "info");
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground space-y-6">
      <Breadcrumb
        items={[
          { label: "Bookings", href: "/user/bookings" },
          { label: "Book Service" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Scheduled Service Booking
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Book a certified mechanic for your vehicle at a scheduled date, shift,
          and service location.
        </p>
      </div>

      <BookingStepper
        currentStep={state.step}
        maxReachedIndex={maxReachedIndex}
        isLocked={state.paymentPhase === "confirmed"}
        onStepSelect={(step) => {
          clearError();
          setStep(step);
        }}
      />

      {error && state.step !== "mechanics" && state.step !== "payment" && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Vehicle */}
      {state.step === "vehicle" && (
        <BookingVehicleSelector
          selectedVehicle={state.selectedVehicle}
          onSelect={selectVehicle}
          onContinue={() => setStep("service")}
        />
      )}

      {/* Step 2: Service */}
      {state.step === "service" && (
        <BookingServiceSelector
          serviceType={state.serviceType}
          problemDescription={state.problemDescription}
          onSelect={setServiceType}
          onProblemDescriptionChange={setProblemDescription}
          onBack={() => setStep("vehicle")}
          onContinue={() => setStep("location")}
        />
      )}

      {/* Step 3: Service Location (reusing existing LocationPicker) */}
      {state.step === "location" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Step 3: Service Location
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose your current GPS location or search an address where the
              vehicle needs service.
            </p>
          </div>

          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <LocationPicker
                location={
                  state.location
                    ? {
                        latitude: state.location.latitude,
                        longitude: state.location.longitude,
                        address: state.location.address,
                      }
                    : null
                }
                onLocationChange={handleLocationPickerChange}
              />

              {state.location && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <Label
                    htmlFor="bookingServiceAddress"
                    className="text-xs font-medium text-foreground"
                  >
                    Confirm or refine service address *
                  </Label>
                  <Input
                    id="bookingServiceAddress"
                    value={state.location.address}
                    onChange={(e) => {
                      setLocationValidationError("");
                      if (!state.location) return;
                      setLocation({
                        ...state.location,
                        address: e.target.value,
                      });
                    }}
                    placeholder="Street, landmark, locality"
                    className="h-10 bg-input border-border text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {locationValidationError && (
            <p role="alert" className="text-xs text-destructive">
              {locationValidationError}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("service")}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>

            <Button type="button" onClick={handleLocationContinue}>
              Continue to Date & Shift
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Date & Shift */}
      {state.step === "schedule" && (
        <BookingDateShiftSelector
          scheduledDate={state.scheduledDate}
          slot={state.slot}
          isSearching={isDiscovering}
          onDateChange={setScheduledDate}
          onSlotChange={setSlot}
          onBack={() => setStep("location")}
          onDiscover={() => void handleDiscover()}
        />
      )}

      {/* Step 5: Discovered Mechanics */}
      {state.step === "mechanics" && (
        <MechanicDiscoveryList
          discoveryResult={state.discoveryResult}
          selectedMechanic={state.selectedMechanic}
          isDiscovering={isDiscovering}
          isReserving={isReserving}
          error={error}
          onSelectMechanic={selectMechanic}
          onChangeSchedule={() => {
            clearError();
            setStep("schedule");
          }}
          onChangeLocation={() => {
            clearError();
            setStep("location");
          }}
          onRetryDiscover={() => void handleDiscover()}
          onConfirmReservation={() => void handleConfirmReservation()}
        />
      )}

      {/* Step 6: Temporary Reservation & Razorpay Payment */}
      {state.step === "payment" && state.reservation && (
        <BookingPaymentStep
          reservation={state.reservation}
          vehicle={state.selectedVehicle}
          mechanic={state.selectedMechanic}
          remainingSeconds={remainingSeconds}
          isReservationExpired={isReservationExpired}
          paymentPhase={state.paymentPhase}
          isRecoveringStatus={isRecoveringStatus}
          error={error}
          onPayNow={() => void handlePayNow()}
          onCheckStatusRecovery={() => void handleCheckRecovery()}
          onSearchAgainAfterExpiry={() => {
            resetReservation();
            void handleDiscover();
          }}
        />
      )}

      {/* Step 7: Confirmed Booking */}
      {state.step === "confirmation" &&
        state.confirmation &&
        state.confirmation.bookingStatus === "confirmed" && (
          <BookingConfirmationView
            confirmation={state.confirmation}
            reservation={state.reservation}
            vehicle={state.selectedVehicle}
            mechanic={state.selectedMechanic}
            location={state.location}
          />
        )}
    </div>
  );
}
