import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  RefreshCw,
  Wrench,
} from "lucide-react";

import { getApiErrorMessage } from "@/api/apiError";
import { Breadcrumb } from "@/components/layout/user/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { scheduledBookingService } from "@/services/booking/scheduledBookingService";
import type {
  BookingDetailsResponse,
  BookingSlot,
} from "@/types/user/scheduledBooking";

const SLOT_LABELS: Record<BookingSlot, string> = {
  morning: "Morning (09:00 – 13:00 IST)",
  afternoon: "Afternoon (14:00 – 18:00 IST)",
  full_day: "Full Day (09:00 – 18:00 IST)",
};

function formatIndiaDate(iso?: string): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatIndiaDateTime(iso?: string): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { showToast } = useToast();

  const [details, setDetails] = useState<BookingDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;

    const loadDetails = async () => {
      try {
        const data = await scheduledBookingService.getBookingDetails(bookingId);
        if (!cancelled) {
          setDetails(data);
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

    void loadDetails();
    return () => {
      cancelled = true;
    };
  }, [bookingId, reloadTick]);

  const handleRefreshStatus = async () => {
    if (!bookingId || refreshingStatus) return;

    try {
      setRefreshingStatus(true);
      const statusRes = await scheduledBookingService.getBookingStatus(bookingId);
      const updatedDetails = await scheduledBookingService.getBookingDetails(
        bookingId
      );
      setDetails(updatedDetails);
      showToast(`Latest booking status: ${statusRes.status}`, "info");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setRefreshingStatus(false);
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground space-y-6">
      <Breadcrumb
        items={[
          { label: "Bookings", href: "/user/bookings" },
          {
            label: bookingId
              ? `Booking #${bookingId.slice(-8).toUpperCase()}`
              : "Booking Details",
          },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Booking Details
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review booking status, assigned mechanic, vehicle, and payment
            verification details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/user/bookings">
            <Button type="button" variant="outline" size="sm">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Bookings
            </Button>
          </Link>

          {bookingId && (
            <Button
              type="button"
              size="sm"
              onClick={() => void handleRefreshStatus()}
              disabled={refreshingStatus || loading}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${refreshingStatus ? "animate-spin" : ""}`}
              />
              Refresh / Recover Status
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 animate-pulse space-y-4">
            <div className="h-5 w-48 rounded bg-muted" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-12 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <Card className="border-destructive/30 bg-card">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Unable to load booking details
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                setError(null);
                setReloadTick((t) => t + 1);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && details && (
        <div className="space-y-5">
          {/* Status Banner */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    details.status === "confirmed" ||
                    details.status === "completed"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {details.status === "confirmed" ||
                  details.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Booking ID:{" "}
                    <span className="font-mono text-foreground">
                      {details.bookingId}
                    </span>
                  </p>
                  <p className="text-sm font-bold text-foreground capitalize mt-0.5">
                    Status: {details.status.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-[11px] text-muted-foreground">
                  Booking Amount
                </p>
                <p className="text-lg font-bold text-foreground">
                  ₹{details.bookingAmount}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service, Vehicle & Mechanic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-4 text-xs">
                <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                  Service & Schedule
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Wrench className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Service Type
                      </p>
                      <p className="font-semibold text-foreground">
                        {details.serviceType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Scheduled Date & Shift
                      </p>
                      <p className="font-semibold text-foreground">
                        {formatIndiaDate(details.scheduledDate)} ·{" "}
                        {SLOT_LABELS[details.slot] ?? details.slot}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Service Location
                      </p>
                      <p className="font-semibold text-foreground">
                        {details.serviceAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-4 text-xs">
                <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                  Vehicle & Mechanic
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Car className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Vehicle Details
                      </p>
                      <p className="font-semibold text-foreground">
                        {details.vehicle
                          ? `${details.vehicle.brand} ${details.vehicle.model}`
                          : details.vehicleId}
                      </p>
                      {details.vehicle && (
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {details.vehicle.registrationNumber} ·{" "}
                          {details.vehicle.vehicleType.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Assigned Mechanic
                      </p>
                      <p className="font-semibold text-foreground">
                        {details.mechanic?.fullName ?? details.mechanicId}
                      </p>
                      {details.mechanic?.workshopName && (
                        <p className="text-[11px] text-muted-foreground">
                          {details.mechanic.workshopName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Information */}
          {details.payment && (
            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">
                    Payment Status & Summary
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Payment Status
                    </p>
                    <p className="font-semibold text-foreground capitalize">
                      {details.payment.status.replace("_", " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground">Amount</p>
                    <p className="font-semibold text-foreground">
                      ₹{details.payment.amount} {details.payment.currency}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Razorpay Order ID
                    </p>
                    <p className="font-mono text-foreground">
                      {details.payment.razorpayOrderId}
                    </p>
                  </div>

                  {details.payment.razorpayPaymentId && (
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Razorpay Payment ID
                      </p>
                      <p className="font-mono text-foreground">
                        {details.payment.razorpayPaymentId}
                      </p>
                    </div>
                  )}

                  {details.payment.paidAt && (
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Paid At (IST)
                      </p>
                      <p className="text-foreground">
                        {formatIndiaDateTime(details.payment.paidAt)}
                      </p>
                    </div>
                  )}

                  {details.payment.failureReason && (
                    <div className="sm:col-span-2">
                      <p className="text-[11px] text-muted-foreground">
                        Status Note
                      </p>
                      <p className="text-destructive">
                        {details.payment.failureReason}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
