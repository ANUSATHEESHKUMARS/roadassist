import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Car,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    Fuel,
    Image as ImageIcon,
    Loader2,
    Mail,
    MapPin,
    Palette,
    Phone,
    Play,
    RefreshCw,
    ShieldCheck,
    UserRound,
    Wrench,
} from "lucide-react";

import { getApiErrorMessage } from "@/api/apiError";
import EmergencyLocationMap from "@/components/emergency/EmergencyLocationMap";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { scheduledBookingService } from "@/services/booking/scheduledBookingService";
import type { BookingDetailsResponse } from "@/types/user/scheduledBooking";
import {
    BOOKING_STATUS_STYLES,
    PAYMENT_STATUS_STYLES,
    buildGoogleMapsUrl,
    formatBookingTimingsLabel,
    formatIndiaBookingDate,
    formatIndiaBookingDateTime,
} from "@/utils/scheduledBookingFormat";

type PendingWorkflowAction = "start" | "complete" | null;

export default function MechanicBookingDetailsPage() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const { showToast } = useToast();

    const [details, setDetails] = useState<BookingDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadTick, setReloadTick] = useState(0);
    const [vehicleImageFailed, setVehicleImageFailed] = useState(false);

    const [confirmAction, setConfirmAction] =
        useState<PendingWorkflowAction>(null);
    const [submittingAction, setSubmittingAction] =
        useState<PendingWorkflowAction>(null);

    const loadBookingDetails = useCallback(async (id: string) => {
        const data = await scheduledBookingService.getMechanicBookingDetails(
            id
        );
        return data;
    }, []);

    useEffect(() => {
        if (!bookingId) {
            setError("Invalid booking ID.");
            setLoading(false);
            return;
        }

        let cancelled = false;
        setVehicleImageFailed(false);

        const fetchDetails = async () => {
            try {
                setError(null);
                const data = await loadBookingDetails(bookingId);
                if (!cancelled) {
                    setDetails(data);
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

        void fetchDetails();
        return () => {
            cancelled = true;
        };
    }, [bookingId, reloadTick, loadBookingDetails]);

    const handleConfirmWorkflowAction = async () => {
        if (!bookingId || !confirmAction || submittingAction) return;

        const actionToRun = confirmAction;
        setConfirmAction(null);
        setSubmittingAction(actionToRun);

        try {
            if (actionToRun === "start") {
                const updated =
                    await scheduledBookingService.startMechanicBooking(
                        bookingId
                    );
                setDetails((prev) =>
                    prev
                        ? {
                              ...prev,
                              status: updated.status,
                              ...(updated.startedAt
                                  ? { startedAt: updated.startedAt }
                                  : {}),
                              ...(updated.updatedAt
                                  ? { updatedAt: updated.updatedAt }
                                  : {}),
                          }
                        : prev
                );
                showToast("Service started. Status updated to In Progress.", "success");
            } else {
                const updated =
                    await scheduledBookingService.completeMechanicBooking(
                        bookingId
                    );
                setDetails((prev) =>
                    prev
                        ? {
                              ...prev,
                              status: updated.status,
                              ...(updated.completedAt
                                  ? { completedAt: updated.completedAt }
                                  : {}),
                              ...(updated.updatedAt
                                  ? { updatedAt: updated.updatedAt }
                                  : {}),
                          }
                        : prev
                );
                showToast("Service completed successfully.", "success");
            }

            // Refresh full record cleanly after transition
            const refreshed = await loadBookingDetails(bookingId);
            setDetails(refreshed);
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setSubmittingAction(null);
        }
    };

    const statusCfg = details
        ? BOOKING_STATUS_STYLES[details.status]
        : BOOKING_STATUS_STYLES.confirmed;

    const paymentCfg = details?.payment
        ? PAYMENT_STATUS_STYLES[details.payment.status]
        : null;

    const hasCoordinates =
        typeof details?.latitude === "number" &&
        Number.isFinite(details.latitude) &&
        typeof details?.longitude === "number" &&
        Number.isFinite(details.longitude);

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <Link
                        to="/mechanic/bookings"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Bookings
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Booking Details
                    </h1>
                </div>

                {!loading && details && (
                    <div className="flex flex-wrap items-center gap-2">
                        {details.status === "confirmed" && (
                            <Button
                                type="button"
                                onClick={() => setConfirmAction("start")}
                                disabled={submittingAction !== null}
                                className="gap-1.5"
                            >
                                {submittingAction === "start" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                                Start Service
                            </Button>
                        )}

                        {details.status === "in_progress" && (
                            <Button
                                type="button"
                                onClick={() => setConfirmAction("complete")}
                                disabled={submittingAction !== null}
                                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {submittingAction === "complete" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                Complete Service
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setLoading(true);
                                setReloadTick((t) => t + 1);
                            }}
                        >
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                            Refresh
                        </Button>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <Card className="border-border bg-card">
                    <CardContent className="flex items-center justify-center gap-3 p-12 text-xs text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span>Loading booking details...</span>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {!loading && error && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Unable to load booking details
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {error}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
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
                                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                Retry
                            </Button>
                            <Link to="/mechanic/bookings">
                                <Button type="button" size="sm" variant="ghost">
                                    Back to List
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Booking Details Content */}
            {!loading && !error && details && (
                <div className="space-y-5">
                    {/* Status Overview Banner */}
                    <Card className="border-border bg-card">
                        <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                                        {details.bookingReference ??
                                            details.bookingId}
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusCfg.badgeClass}`}
                                    >
                                        {statusCfg.label}
                                    </span>
                                </div>
                                <p className="font-mono text-[11px] text-muted-foreground">
                                    Booking ID: {details.bookingId}
                                </p>
                            </div>

                            <div className="sm:text-right">
                                <p className="text-[11px] text-muted-foreground">
                                    Scheduled Booking Fee
                                </p>
                                <p className="text-xl font-bold text-foreground">
                                    ₹{details.bookingAmount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* 1. Customer Details */}
                        <Card className="border-border bg-card">
                            <CardContent className="space-y-4 p-5 text-xs">
                                <h2 className="flex items-center gap-2 border-b border-border pb-2.5 text-sm font-bold text-foreground">
                                    <UserRound className="h-4 w-4 text-primary" />
                                    Customer Details
                                </h2>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Full Name
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {details.customer?.fullName ??
                                                "Unavailable"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Phone Number
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {details.customer?.phoneNumber ||
                                                "Not provided"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Email Address
                                        </p>
                                        <p className="flex items-center gap-1.5 font-medium text-foreground">
                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>
                                                {details.customer?.email ||
                                                    "Not provided"}
                                            </span>
                                        </p>
                                    </div>

                                    {details.customer?.phoneNumber && (
                                        <div className="pt-1">
                                            <a
                                                href={`tel:${details.customer.phoneNumber}`}
                                                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                                            >
                                                <Phone className="h-3.5 w-3.5" />
                                                Contact Customer
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Vehicle Details */}
                        <Card className="border-border bg-card">
                            <CardContent className="space-y-4 p-5 text-xs">
                                <h2 className="flex items-center gap-2 border-b border-border pb-2.5 text-sm font-bold text-foreground">
                                    <Car className="h-4 w-4 text-primary" />
                                    Vehicle Details
                                </h2>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    {details.vehicle?.vehicleImage &&
                                    !vehicleImageFailed ? (
                                        <img
                                            src={details.vehicle.vehicleImage}
                                            alt={`${details.vehicle.brand} ${details.vehicle.model}`}
                                            onError={() =>
                                                setVehicleImageFailed(true)
                                            }
                                            className="h-28 w-full shrink-0 rounded-xl border border-border object-cover sm:w-36"
                                        />
                                    ) : (
                                        <div className="flex h-28 w-full shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 text-muted-foreground sm:w-36">
                                            <ImageIcon className="h-6 w-6 opacity-60" />
                                            <span className="mt-1 text-[10px]">
                                                No Vehicle Image
                                            </span>
                                        </div>
                                    )}

                                    <div className="grid flex-1 grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Vehicle Type
                                            </p>
                                            <p className="font-semibold capitalize text-foreground">
                                                {details.vehicle?.vehicleType ??
                                                    "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Brand & Model
                                            </p>
                                            <p className="font-semibold text-foreground">
                                                {details.vehicle
                                                    ? `${details.vehicle.brand} ${details.vehicle.model}`
                                                    : details.vehicleId}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Registration Number
                                            </p>
                                            <p className="font-mono font-semibold text-foreground">
                                                {details.vehicle
                                                    ?.registrationNumber ?? "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Manufacturing Year
                                            </p>
                                            <p className="font-semibold text-foreground">
                                                {details.vehicle?.year ?? "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                <Fuel className="h-3 w-3" />
                                                Fuel Type
                                            </p>
                                            <p className="font-semibold capitalize text-foreground">
                                                {details.vehicle?.fuelType ??
                                                    "-"}
                                            </p>
                                        </div>

                                        {details.vehicle?.color && (
                                            <div>
                                                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Palette className="h-3 w-3" />
                                                    Color
                                                </p>
                                                <p className="font-semibold capitalize text-foreground">
                                                    {details.vehicle.color}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Service Details */}
                        <Card className="border-border bg-card">
                            <CardContent className="space-y-4 p-5 text-xs">
                                <h2 className="flex items-center gap-2 border-b border-border pb-2.5 text-sm font-bold text-foreground">
                                    <Wrench className="h-4 w-4 text-primary" />
                                    Service Details
                                </h2>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Service Category
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {details.serviceCategory
                                                ?.categoryName ??
                                                details.serviceType}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Subcategory
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {details.serviceCategory
                                                ?.subcategoryName ??
                                                details.serviceType}
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="text-[11px] text-muted-foreground">
                                            Requested Service Type
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {details.serviceType}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border bg-secondary/30 p-3.5">
                                    <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                                        Customer Problem Description
                                    </p>
                                    <p
                                        className={`whitespace-pre-line text-xs ${
                                            details.problemDescription
                                                ? "text-foreground"
                                                : "italic text-muted-foreground"
                                        }`}
                                    >
                                        {details.problemDescription ||
                                            "No problem description provided by the customer."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Schedule Details */}
                        <Card className="border-border bg-card">
                            <CardContent className="space-y-4 p-5 text-xs">
                                <h2 className="flex items-center gap-2 border-b border-border pb-2.5 text-sm font-bold text-foreground">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Schedule Details
                                </h2>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Booking Date
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {formatIndiaBookingDate(
                                                details.scheduledDate
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Timezone
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            Asia/Kolkata (IST)
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="text-[11px] text-muted-foreground">
                                            Selected Shift & Effective Timing
                                        </p>
                                        <p className="flex items-center gap-1.5 font-semibold text-foreground">
                                            <Clock className="h-3.5 w-3.5 text-primary" />
                                            <span>
                                                {formatBookingTimingsLabel(
                                                    details.slot,
                                                    details.scheduleTimings
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                                    {details.confirmedAt && (
                                        <p>
                                            Confirmed:{" "}
                                            <span className="text-foreground">
                                                {formatIndiaBookingDateTime(
                                                    details.confirmedAt
                                                )}
                                            </span>
                                        </p>
                                    )}
                                    {details.startedAt && (
                                        <p>
                                            Service Started:{" "}
                                            <span className="text-foreground">
                                                {formatIndiaBookingDateTime(
                                                    details.startedAt
                                                )}
                                            </span>
                                        </p>
                                    )}
                                    {details.completedAt && (
                                        <p>
                                            Service Completed:{" "}
                                            <span className="text-foreground">
                                                {formatIndiaBookingDateTime(
                                                    details.completedAt
                                                )}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 5. Location Details */}
                    <Card className="border-border bg-card">
                        <CardContent className="space-y-4 p-5 text-xs">
                            <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-center">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    Service Location
                                </h2>

                                {hasCoordinates && (
                                    <a
                                        href={buildGoogleMapsUrl(
                                            details.latitude!,
                                            details.longitude!
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                                    >
                                        <span>Open in Google Maps</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="sm:col-span-2">
                                    <p className="text-[11px] text-muted-foreground">
                                        Complete Service Address
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {details.serviceAddress}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Persisted Coordinates
                                    </p>
                                    <p className="font-mono font-semibold text-foreground">
                                        {hasCoordinates
                                            ? `${details.latitude!.toFixed(
                                                  6
                                              )}, ${details.longitude!.toFixed(
                                                  6
                                              )}`
                                            : "Not recorded"}
                                    </p>
                                </div>
                            </div>

                            {hasCoordinates ? (
                                <EmergencyLocationMap
                                    location={{
                                        latitude: details.latitude!,
                                        longitude: details.longitude!,
                                        address: details.serviceAddress,
                                    }}
                                    onLocationChange={() => {}}
                                    readOnly
                                />
                            ) : (
                                <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-xs text-muted-foreground">
                                    Exact GPS coordinates were not stored on this
                                    legacy booking record. Use the written service
                                    address above.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 6. Payment & Allocation Summary */}
                    <Card className="border-border bg-card">
                        <CardContent className="space-y-4 p-5 text-xs">
                            <h2 className="flex items-center gap-2 border-b border-border pb-2.5 text-sm font-bold text-foreground">
                                <CreditCard className="h-4 w-4 text-primary" />
                                Payment & Allocation Summary
                            </h2>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Booking Amount
                                    </p>
                                    <p className="text-base font-bold text-foreground">
                                        ₹{details.bookingAmount}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Payment Status
                                    </p>
                                    {paymentCfg ? (
                                        <span
                                            className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${paymentCfg.badgeClass}`}
                                        >
                                            {paymentCfg.label}
                                        </span>
                                    ) : (
                                        <p className="font-medium text-muted-foreground">
                                            Verification pending
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Payment Verified At
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {details.payment?.paidAt
                                            ? formatIndiaBookingDateTime(
                                                  details.payment.paidAt
                                              )
                                            : "-"}
                                    </p>
                                </div>
                            </div>

                            {details.payment?.razorpayPaymentId && (
                                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-400">
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    <span>
                                        Verified Transaction Reference:{" "}
                                        <span className="font-mono font-semibold text-foreground">
                                            {details.payment.razorpayPaymentId}
                                        </span>
                                    </span>
                                </div>
                            )}

                            {details.allocation && (
                                <div className="space-y-2 border-t border-border pt-3">
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        Platform Revenue Allocation (Total ₹
                                        {details.allocation.totalAmount})
                                    </p>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl border border-border bg-secondary/40 p-3">
                                            <p className="text-[11px] text-muted-foreground">
                                                Super Admin
                                            </p>
                                            <p className="mt-0.5 text-sm font-bold text-foreground">
                                                ₹
                                                {
                                                    details.allocation
                                                        .superAdminShare
                                                }
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-border bg-secondary/40 p-3">
                                            <p className="text-[11px] text-muted-foreground">
                                                Admin
                                            </p>
                                            <p className="mt-0.5 text-sm font-bold text-foreground">
                                                ₹{details.allocation.adminShare}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                                            <p className="text-[11px] text-emerald-400">
                                                Mechanic Share
                                            </p>
                                            <p className="mt-0.5 text-sm font-bold text-emerald-400">
                                                ₹
                                                {
                                                    details.allocation
                                                        .mechanicShare
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Confirmation Dialog for Status Transition */}
            <AlertDialog
                open={confirmAction !== null}
                onOpenChange={(open) => {
                    if (!open) setConfirmAction(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction === "start"
                                ? "Start Scheduled Service?"
                                : "Complete Scheduled Service?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction === "start"
                                ? "This marks the booking as In Progress and records the service start time."
                                : "This marks the scheduled service as Completed. Ensure all repair and inspection work is finished."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => void handleConfirmWorkflowAction()}
                        >
                            {confirmAction === "start"
                                ? "Yes, Start Service"
                                : "Yes, Complete Service"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

