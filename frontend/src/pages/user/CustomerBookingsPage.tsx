import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Calendar,
  CalendarPlus,
  Car,
  ChevronLeft,
  ChevronRight,
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
import { scheduledBookingService } from "@/services/booking/scheduledBookingService";
import type {
  BookingHistoryCategory,
  BookingSlot,
  BookingStatus,
  MyBookingItem,
  MyBookingsCounts,
  MyBookingsPagination,
  PaymentStatus,
} from "@/types/user/scheduledBooking";

const CATEGORY_TABS: { key: BookingHistoryCategory; label: string }[] = [
  { key: "all", label: "All Bookings" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const SLOT_LABELS: Record<BookingSlot, string> = {
  morning: "Morning (09:00 – 13:00)",
  afternoon: "Afternoon (14:00 – 18:00)",
  full_day: "Full Day (09:00 – 18:00)",
};

const BOOKING_STATUS_STYLES: Record<
  BookingStatus,
  { label: string; badgeClass: string }
> = {
  pending_payment: {
    label: "Pending Payment",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  accepted: {
    label: "Accepted",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  confirmed: {
    label: "Confirmed",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
  expired: {
    label: "Expired",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

const PAYMENT_STATUS_STYLES: Record<
  PaymentStatus,
  { label: string; badgeClass: string }
> = {
  created: {
    label: "Order Created",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  pending: {
    label: "Payment Pending",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  paid: {
    label: "Paid",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  failed: {
    label: "Payment Failed",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
  refund_requested: {
    label: "Refund Requested",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  refund_pending: {
    label: "Refund Pending",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  refunded: {
    label: "Refunded",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

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

const DEFAULT_COUNTS: MyBookingsCounts = {
  all: 0,
  upcoming: 0,
  completed: 0,
  cancelled: 0,
};

const DEFAULT_PAGINATION: MyBookingsPagination = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export default function CustomerBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<MyBookingItem[]>([]);
  const [counts, setCounts] = useState<MyBookingsCounts>(DEFAULT_COUNTS);
  const [pagination, setPagination] =
    useState<MyBookingsPagination>(DEFAULT_PAGINATION);
  const [category, setCategory] = useState<BookingHistoryCategory>("all");
  const [page, setPage] = useState<number>(1);
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        const data = await scheduledBookingService.getMyBookings({
          page,
          limit: 8,
          category,
        });

        if (!cancelled) {
          setBookings(data.bookings);
          setCounts(data.counts);
          setPagination(data.pagination);
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

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [page, category, refreshTick]);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRefreshTick((t) => t + 1);
  };

  const handleCategoryChange = (nextCategory: BookingHistoryCategory) => {
    if (nextCategory === category) return;
    setLoading(true);
    setError(null);
    setCategory(nextCategory);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setLoading(true);
    setError(null);
    setPage(nextPage);
  };

  return (
    <div className="min-h-full bg-background text-foreground space-y-6">
      <Breadcrumb items={[{ label: "Bookings" }]} />

      {/* Header + Primary CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bookings
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            View your scheduled service bookings, payment status, and history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Link to="/user/book-service">
            <Button type="button" size="sm">
              <CalendarPlus className="h-4 w-4 mr-1.5" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {CATEGORY_TABS.map((tab) => {
          const isActive = category === tab.key;
          const count = counts[tab.key];

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleCategoryChange(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4" aria-label="Loading bookings">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border bg-card p-5 animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-6 w-24 rounded-full bg-muted" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-4 w-36 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-4 w-28 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card className="border-destructive/30 bg-card">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Unable to load bookings
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="max-w-md space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                {category === "all"
                  ? "No scheduled bookings yet"
                  : `No ${category} bookings`}
              </h2>
              <p className="text-xs text-muted-foreground">
                {category === "all"
                  ? "Book a certified mechanic at your preferred date, shift, and location."
                  : "You do not have any bookings under this filter right now."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {category !== "all" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCategoryChange("all")}
                >
                  View All Bookings
                </Button>
              )}
              <Link to="/user/book-service">
                <Button type="button" size="sm">
                  <CalendarPlus className="h-4 w-4 mr-1.5" />
                  New Booking
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusStyle =
              BOOKING_STATUS_STYLES[booking.status] ??
              BOOKING_STATUS_STYLES.pending;
            const paymentStyle = booking.paymentStatus
              ? PAYMENT_STATUS_STYLES[booking.paymentStatus]
              : null;

            return (
              <Card
                key={booking.bookingId}
                className="border-border bg-card hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/user/bookings/${booking.bookingId}`)}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top row: Service Type + Booking ID + Status Badges */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-card-foreground">
                          {booking.serviceType}
                        </h3>
                        <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          #{booking.bookingId.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">
                          {booking.serviceAddress}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyle.badgeClass}`}
                      >
                        {statusStyle.label}
                      </span>

                      {paymentStyle && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${paymentStyle.badgeClass}`}
                        >
                          <CreditCard className="h-3 w-3" />
                          {paymentStyle.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border text-xs">
                    <div className="flex items-start gap-2">
                      <Car className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Vehicle
                        </p>
                        <p className="font-semibold text-foreground">
                          {booking.vehicle
                            ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                            : "Vehicle"}
                        </p>
                        {booking.vehicle && (
                          <p className="text-[11px] font-mono text-muted-foreground">
                            {booking.vehicle.registrationNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Wrench className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Mechanic
                        </p>
                        <p className="font-semibold text-foreground">
                          {booking.mechanic?.fullName ?? "Assigned Mechanic"}
                        </p>
                        {booking.mechanic?.workshopName && (
                          <p className="text-[11px] text-muted-foreground">
                            {booking.mechanic.workshopName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Scheduled Slot
                        </p>
                        <p className="font-semibold text-foreground">
                          {formatIndiaDate(booking.scheduledDate)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {SLOT_LABELS[booking.slot] ?? booking.slot}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="sm:text-right">
                        <p className="text-[11px] text-muted-foreground">
                          Booking Amount
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          ₹{booking.bookingAmount}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/bookings/${booking.bookingId}`);
                        }}
                      >
                        View Details
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Showing page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage || loading}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage || loading}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
