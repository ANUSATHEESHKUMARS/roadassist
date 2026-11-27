import {
  AlertTriangle,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  BookingSlot,
  CreateBookingReservationResponse,
  DiscoveredMechanicItem,
  PaymentPhase,
} from "@/types/user/scheduledBooking";
import type { Vehicle } from "@/types/user/vehicle";

const SLOT_LABELS: Record<BookingSlot, string> = {
  morning: "Morning (09:00 – 13:00 IST)",
  afternoon: "Afternoon (14:00 – 18:00 IST)",
  full_day: "Full Day (09:00 – 18:00 IST)",
};

function formatCountdown(totalSeconds: number | null): string {
  if (totalSeconds === null) return "--:--";
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatIndiaDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

interface BookingPaymentStepProps {
  reservation: CreateBookingReservationResponse;
  vehicle: Vehicle | null;
  mechanic: DiscoveredMechanicItem | null;
  remainingSeconds: number | null;
  isReservationExpired: boolean;
  paymentPhase: PaymentPhase;
  isRecoveringStatus: boolean;
  error: string | null;
  onPayNow: () => void;
  onCheckStatusRecovery: () => void;
  onSearchAgainAfterExpiry: () => void;
}

export function BookingPaymentStep({
  reservation,
  vehicle,
  mechanic,
  remainingSeconds,
  isReservationExpired,
  paymentPhase,
  isRecoveringStatus,
  error,
  onPayNow,
  onCheckStatusRecovery,
  onSearchAgainAfterExpiry,
}: BookingPaymentStepProps) {
  const isBusy =
    paymentPhase === "creating_order" ||
    paymentPhase === "checkout_open" ||
    paymentPhase === "verifying";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Step 6: Complete Booking Payment
          </h2>
          <p className="text-xs text-muted-foreground">
            Your slot is temporarily held. Complete payment before the
            reservation timer expires.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-mono font-bold ${
            isReservationExpired
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-primary/40 bg-primary/10 text-primary"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>
            {isReservationExpired
              ? "Reservation Expired"
              : `Hold expires in ${formatCountdown(remainingSeconds)}`}
          </span>
        </div>
      </div>

      {/* Reservation Summary Card */}
      <Card className="border-border bg-card">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-[11px] text-muted-foreground">
                Reservation ID
              </p>
              <p className="text-xs font-mono font-semibold text-foreground">
                {reservation.bookingId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">
                Fixed Booking Fee
              </p>
              <p className="text-xl font-bold text-primary">
                ₹{reservation.bookingAmount}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[11px] text-muted-foreground">Vehicle</p>
              <p className="font-semibold text-foreground">
                {vehicle
                  ? `${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})`
                  : reservation.vehicleId}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">Mechanic</p>
              <p className="font-semibold text-foreground">
                {mechanic?.fullName ?? reservation.mechanicId}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">Service Type</p>
              <p className="font-semibold text-foreground">
                {reservation.serviceType}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">
                Scheduled Date & Shift
              </p>
              <p className="font-semibold text-foreground">
                {formatIndiaDate(reservation.scheduledDate)} ·{" "}
                {SLOT_LABELS[reservation.slot] ?? reservation.slot}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[11px] text-muted-foreground">
                Service Location
              </p>
              <p className="font-semibold text-foreground">
                {reservation.serviceAddress}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expired Alert */}
      {isReservationExpired && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-3"
        >
          <div className="flex items-start gap-2.5 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Your temporary slot hold expired</p>
              <p className="mt-0.5 text-muted-foreground">
                Please run a fresh availability check to reserve a slot again.
                If you already completed payment, check your booking status
                below.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onSearchAgainAfterExpiry}
            >
              Search Mechanics Again
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCheckStatusRecovery}
              disabled={isRecoveringStatus}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${isRecoveringStatus ? "animate-spin" : ""}`}
              />
              Check Booking Status
            </Button>
          </div>
        </div>
      )}

      {/* Payment Error / Cancellation / Pending Recovery Notice */}
      {!isReservationExpired &&
        (error ||
          paymentPhase === "cancelled" ||
          paymentPhase === "pending_recovery") && (
          <div
            role="alert"
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-xs"
          >
            <div className="flex items-start gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  {paymentPhase === "pending_recovery"
                    ? "Verifying payment status with server"
                    : paymentPhase === "cancelled"
                      ? "Payment checkout was closed before completion"
                      : "Payment issue"}
                </p>
                {error && <p className="text-foreground/90">{error}</p>}
                {paymentPhase === "pending_recovery" && (
                  <p className="text-muted-foreground">
                    If your amount was debited, click Check Booking Status to
                    recover confirmation without creating a duplicate order.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Payment Action Controls */}
      {!isReservationExpired && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Secured by Razorpay · Confirmation happens only after backend
              verification
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onCheckStatusRecovery}
              disabled={isRecoveringStatus || isBusy}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1.5 ${isRecoveringStatus ? "animate-spin" : ""}`}
              />
              Check Status
            </Button>

            <Button
              type="button"
              onClick={onPayNow}
              disabled={isBusy || isReservationExpired}
            >
              {isBusy ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  {paymentPhase === "creating_order"
                    ? "Creating Order..."
                    : paymentPhase === "verifying"
                      ? "Verifying Payment..."
                      : "Checkout Open..."}
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-1.5" />
                  Pay ₹{reservation.bookingAmount} with Razorpay
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

