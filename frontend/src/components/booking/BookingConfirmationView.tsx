import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  BookingLocation,
  BookingSlot,
  CreateBookingReservationResponse,
  DiscoveredMechanicItem,
  VerifyPaymentResponse,
} from "@/types/user/scheduledBooking";
import type { Vehicle } from "@/types/user/vehicle";

const SLOT_LABELS: Record<BookingSlot, string> = {
  morning: "Morning (09:00 – 13:00 IST)",
  afternoon: "Afternoon (14:00 – 18:00 IST)",
  full_day: "Full Day (09:00 – 18:00 IST)",
};

function formatIndiaDate(isoDate?: string): string {
  if (!isoDate) return "-";
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

interface BookingConfirmationViewProps {
  confirmation: VerifyPaymentResponse;
  reservation: CreateBookingReservationResponse | null;
  vehicle: Vehicle | null;
  mechanic: DiscoveredMechanicItem | null;
  location: BookingLocation | null;
}

export function BookingConfirmationView({
  confirmation,
  reservation,
  vehicle,
  mechanic,
  location,
}: BookingConfirmationViewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-emerald-500/30 bg-card">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Booking Confirmed
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Your payment has been verified and your scheduled mechanic
                booking is confirmed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-secondary/40 p-4 text-xs">
            <div>
              <p className="text-[11px] text-muted-foreground">Booking ID</p>
              <p className="font-mono font-semibold text-foreground">
                {confirmation.bookingId}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">
                Booking & Payment Status
              </p>
              <p className="font-semibold text-emerald-400 capitalize">
                {confirmation.bookingStatus} · {confirmation.paymentStatus}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">Vehicle</p>
              <p className="font-semibold text-foreground">
                {vehicle
                  ? `${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})`
                  : reservation?.vehicleId ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">Mechanic</p>
              <p className="font-semibold text-foreground">
                {mechanic?.fullName ?? reservation?.mechanicId ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">Service Type</p>
              <p className="font-semibold text-foreground">
                {reservation?.serviceType ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">
                Scheduled Date & Shift
              </p>
              <p className="font-semibold text-foreground">
                {formatIndiaDate(reservation?.scheduledDate)} ·{" "}
                {reservation?.slot
                  ? SLOT_LABELS[reservation.slot] ?? reservation.slot
                  : "-"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[11px] text-muted-foreground">
                Service Location
              </p>
              <p className="font-semibold text-foreground">
                {reservation?.serviceAddress ?? location?.address ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">Amount Paid</p>
              <p className="font-bold text-foreground">
                ₹{confirmation.amount} {confirmation.currency}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground">
                Razorpay Payment ID
              </p>
              <p className="font-mono text-foreground">
                {confirmation.razorpayPaymentId}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={`/user/bookings/${confirmation.bookingId}`}>
              <Button type="button">
                View Booking Details
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>

            <Link to="/user/bookings">
              <Button type="button" variant="outline">
                <Calendar className="h-4 w-4 mr-1.5" />
                Go to My Bookings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

