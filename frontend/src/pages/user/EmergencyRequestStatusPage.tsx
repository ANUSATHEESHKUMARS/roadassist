import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { emergencyRequestService } from "@/services/EmergencyRequestService";
import type {
    EmergencyRequestStatusResponse,
    EmergencyServiceReport,
    MechanicLiveLocation,
} from "@/types/emergencyRequest";
import { socket } from "@/services/socket/socket";
import { getApiErrorMessage } from "@/api/apiError";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/toast/ToastProvider";
import EmergencyTrackingMap from "@/components/emergency/EmergencyTrackingMap";
import { EmergencyProgressTimeline } from "@/components/emergency/EmergencyProgressTimeline";
import { InspectionDetailsCard } from "@/components/emergency/InspectionDetailsCard";
import { EstimateBreakdownCard } from "@/components/emergency/EstimateBreakdownCard";
import { EmergencyPaymentPanel } from "@/components/emergency/EmergencyPaymentPanel";
import { RepairProgressSection } from "@/components/emergency/RepairProgressSection";
import { EmergencyServiceReportCard } from "@/components/emergency/EmergencyServiceReportCard";
import {
    calculateGeoDistanceKm,
    estimateTravelEtaMinutes,
} from "@/utils/geoDistance";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    MapPin,
    Clock,
    CheckCircle2,
    Loader2,
    AlertTriangle,
    Phone,
    Mail,
    UserRound,
    ArrowLeft,
    Search,
    Wrench,
    Navigation,
    Car,
    XCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; bg: string; border: string; icon: typeof Clock }
> = {
    pending: {
        label: "Pending",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        icon: Clock,
    },
    searching: {
        label: "Searching for Mechanic",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        icon: Search,
    },
    assigned: {
        label: "Mechanic Assigned",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: CheckCircle2,
    },
    on_the_way: {
        label: "Mechanic On The Way",
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        icon: Navigation,
    },
    arrived: {
        label: "Mechanic Arrived",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: MapPin,
    },
    cancelled: {
        label: "Cancelled",
        color: "text-muted-foreground",
        bg: "bg-muted",
        border: "border-border",
        icon: AlertTriangle,
    },
    completed: {
        label: "Completed",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: CheckCircle2,
    },
};

const ISSUE_LABELS: Record<string, string> = {
    battery: "Battery Problem",
    flat_tyre: "Flat Tyre",
    engine: "Engine Problem",
    brake: "Brake Problem",
    electrical: "Electrical Issue",
    fuel: "Fuel Problem",
    accident: "Accident",
    overheating: "Overheating",
    noise: "Unusual Noise",
    other: "Other Issue",
};

const ACTIVE_TRACKING_STATUSES = ["assigned", "on_the_way", "arrived"];
const WORKFLOW_SOCKET_EVENTS = [
    "emergency_status_updated",
    "emergency_request_accepted",
    "emergency_travel_started",
    "emergency_mechanic_arrived",
    "emergency_inspection_updated",
    "emergency_estimate_updated",
    "emergency_payment_updated",
    "emergency_repair_updated",
    "emergency_request_cancelled",
] as const;

export default function EmergencyRequestStatusPage() {
    const { requestId } = useParams<{ requestId: string }>();
    const routeLocation = useLocation();
    const user = useAuthStore((state) => state.user);
    const { showToast } = useToast();

    const [data, setData] = useState<EmergencyRequestStatusResponse | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mechanicLocation, setMechanicLocation] =
        useState<MechanicLiveLocation | null>(null);
    const [serviceReport, setServiceReport] =
        useState<EmergencyServiceReport | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const routeState = routeLocation.state as
        | {
              discoverySummary?: {
                  matchedMechanicsCount?: number;
                  searchRadiusKm?: number | null;
                  fallbackUsed?: boolean;
              };
          }
        | undefined;

    const fetchStatus = useCallback(async () => {
        if (!requestId) return;
        try {
            const result =
                await emergencyRequestService.getRequestStatus(requestId);
            setData(result);
            if (
                ACTIVE_TRACKING_STATUSES.includes(result.request.status) &&
                result.lastKnownLocation
            ) {
                setMechanicLocation(result.lastKnownLocation);
            } else if (
                result.request.status === "completed" ||
                result.request.status === "cancelled"
            ) {
                setMechanicLocation(null);
            }
            setError("");
        } catch {
            setError("Unable to load request status.");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        void fetchStatus();
    }, [fetchStatus]);

    useEffect(() => {
        if (!requestId || data?.request.status !== "completed") {
            return;
        }
        let active = true;
        emergencyRequestService
            .getServiceReport(requestId)
            .then((report) => {
                if (active) setServiceReport(report);
            })
            .catch(() => {
                // Report fetch is non-fatal while status stays visible
            });
        return () => {
            active = false;
        };
    }, [requestId, data?.request.status]);

    const assignedMechanicId = data?.request.assignedMechanicId ?? null;
    const currentStatus = data?.request.status ?? null;
    const isActiveTracking = Boolean(
        requestId &&
            assignedMechanicId &&
            currentStatus &&
            ACTIVE_TRACKING_STATUSES.includes(currentStatus)
    );

    // Subscribe to real-time Socket.IO status updates & live location (no polling)
    useEffect(() => {
        if (!requestId) return;

        const joinTrackingIfActive = () => {
            if (isActiveTracking) {
                socket.emit("join_emergency_tracking", { requestId });
            }
        };

        const handleConnect = () => {
            void fetchStatus();
            joinTrackingIfActive();
        };

        const handleWorkflowEvent = (payload?: {
            emergencyRequestId?: string;
            requestId?: string;
            id?: string;
            _id?: string;
        }) => {
            const targetId =
                payload?.emergencyRequestId ??
                payload?.requestId ??
                payload?.id ??
                payload?._id;
            if (targetId && targetId !== requestId) {
                return;
            }
            void fetchStatus();
        };

        const handleLocationUpdate = (loc: MechanicLiveLocation) => {
            if (loc.requestId && loc.requestId !== requestId) {
                return;
            }
            if (isActiveTracking) {
                setMechanicLocation(loc);
            }
        };

        const handleTrackingError = (response: { message: string }) => {
            console.error("Tracking error:", response.message);
        };

        socket.on("connect", handleConnect);
        socket.on("mechanic_location_updated", handleLocationUpdate);
        socket.on("emergency_tracking_error", handleTrackingError);
        WORKFLOW_SOCKET_EVENTS.forEach((eventName) => {
            socket.on(eventName, handleWorkflowEvent);
        });

        if (!socket.connected) {
            socket.connect();
        } else {
            joinTrackingIfActive();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("mechanic_location_updated", handleLocationUpdate);
            socket.off("emergency_tracking_error", handleTrackingError);
            WORKFLOW_SOCKET_EVENTS.forEach((eventName) => {
                socket.off(eventName, handleWorkflowEvent);
            });
        };
    }, [requestId, isActiveTracking, fetchStatus]);

    const handleApproveEstimate = async (estimateId: string) => {
        if (!requestId) return;
        try {
            await emergencyRequestService.approveEstimate(requestId, estimateId);
            showToast(
                "Estimate approved. Proceed with online payment to authorize repair.",
                "success"
            );
            await fetchStatus();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        }
    };

    const handleRejectEstimate = async (estimateId: string, reason?: string) => {
        if (!requestId) return;
        try {
            await emergencyRequestService.rejectEstimate(
                requestId,
                estimateId,
                reason
            );
            showToast(
                "Estimate rejected. The mechanic has been notified to submit a revision.",
                "warning"
            );
            await fetchStatus();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        }
    };

    const handleCancelRequest = async () => {
        if (!requestId || cancelling) return;
        setCancelling(true);
        try {
            await emergencyRequestService.cancelRequest(
                requestId,
                cancelReason.trim() || undefined
            );
            setCancelDialogOpen(false);
            setCancelReason("");
            showToast("Emergency request cancelled.", "success");
            await fetchStatus();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">
                    Loading request status…
                </span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="mx-auto max-w-2xl space-y-4 p-6">
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <AlertTriangle className="mt-0.5 size-5 text-destructive" />
                    <p className="text-sm text-destructive">
                        {error || "Request not found."}
                    </p>
                </div>

                <Link to="/user/emergency">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="size-4" />
                        Back
                    </Button>
                </Link>
            </div>
        );
    }

    const {
        request,
        mechanicDetails,
        vehicleDetails,
        inspection,
        latestEstimate,
        estimateHistory,
        payment,
        repair,
    } = data;

    const statusCfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;
    const StatusIcon = statusCfg.icon;

    const distanceKm =
        mechanicLocation && isActiveTracking
            ? calculateGeoDistanceKm(
                  request.location.latitude,
                  request.location.longitude,
                  mechanicLocation.latitude,
                  mechanicLocation.longitude
              )
            : null;
    const etaMinutes =
        distanceKm !== null ? estimateTravelEtaMinutes(distanceKm) : null;

    const canCancelRequest =
        ["pending", "searching", "assigned", "on_the_way", "arrived"].includes(
            request.status
        ) &&
        !repair &&
        payment?.status !== "paid" &&
        latestEstimate?.status !== "paid";

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link to="/user/emergency-requests">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="size-4" />
                        Back to Emergency Requests
                    </Button>
                </Link>

                {canCancelRequest && (
                    <AlertDialog
                        open={cancelDialogOpen}
                        onOpenChange={setCancelDialogOpen}
                    >
                        <AlertDialogTrigger
                            render={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                                />
                            }
                        >
                            <XCircle className="size-4" />
                            Cancel Request
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Cancel Emergency Request?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to cancel this
                                    emergency assistance request? This stops
                                    mechanic dispatch immediately.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Input
                                placeholder="Optional cancellation reason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            />
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={cancelling}>
                                    Keep Request
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleCancelRequest}
                                    disabled={cancelling}
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                    {cancelling
                                        ? "Cancelling..."
                                        : "Confirm Cancellation"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Status Header */}
            <Card className={`${statusCfg.border}`}>
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div
                            className={`flex size-12 items-center justify-center rounded-xl ${statusCfg.bg}`}
                        >
                            <StatusIcon className={`size-6 ${statusCfg.color}`} />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Request Status
                            </p>
                            <p className={`text-lg font-bold ${statusCfg.color}`}>
                                {statusCfg.label}
                            </p>
                        </div>
                    </div>

                    {(request.status === "pending" ||
                        request.status === "searching") && (
                        <div className="mt-3 space-y-1.5">
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="size-4 animate-spin" />
                                Waiting for a nearby eligible mechanic within 5–10
                                km to accept…
                            </p>
                            {routeState?.discoverySummary?.matchedMechanicsCount ===
                                0 && (
                                <p className="text-xs text-amber-400">
                                    No mechanics were online within 10 km when you
                                    submitted. Newly available mechanics nearby can
                                    still accept it.
                                </p>
                            )}
                        </div>
                    )}

                    {request.status === "cancelled" &&
                        request.cancellationReason && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Cancellation reason: {request.cancellationReason}
                            </p>
                        )}
                </CardContent>
            </Card>

            {/* Real-time 13-Step Progress Timeline */}
            <EmergencyProgressTimeline
                request={request}
                inspection={inspection}
                latestEstimate={latestEstimate}
                payment={payment}
                repair={repair}
                distanceKm={distanceKm}
            />

            {/* Assigned Mechanic (persistent across assigned -> completed) */}
            {request.assignedMechanicId &&
                mechanicDetails &&
                request.status !== "cancelled" && (
                    <Card className="border-emerald-500/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wrench className="size-4 text-emerald-400" />
                                Assigned Mechanic
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted">
                                    <UserRound className="size-5 text-muted-foreground" />
                                </div>

                                <div>
                                    <p className="font-semibold">
                                        {mechanicDetails.fullName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Verified Roadside Mechanic
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-muted/40 p-3 sm:grid-cols-2">
                                <a
                                    href={`tel:${mechanicDetails.phoneNumber}`}
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <Phone className="size-4 shrink-0" />
                                    <span>{mechanicDetails.phoneNumber}</span>
                                </a>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="size-4 shrink-0 text-primary" />
                                    <span className="truncate">
                                        {mechanicDetails.email}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

            {/* Live Mechanic Tracking Map & Distance/ETA */}
            {isActiveTracking && (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold">
                            Live Mechanic Tracking
                        </h2>
                        {distanceKm !== null && etaMinutes !== null && (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                {distanceKm.toFixed(1)} km away • Est.{" "}
                                {etaMinutes} min
                            </span>
                        )}
                    </div>

                    <EmergencyTrackingMap
                        customerLocation={request.location}
                        mechanicLocation={mechanicLocation}
                    />

                    {mechanicLocation ? (
                        <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs sm:grid-cols-3">
                            <div>
                                <p className="text-muted-foreground">
                                    Live Distance
                                </p>
                                <p className="font-semibold text-foreground">
                                    {distanceKm !== null
                                        ? `${distanceKm.toFixed(2)} km`
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Approx. ETA
                                </p>
                                <p className="font-semibold text-foreground">
                                    {etaMinutes !== null
                                        ? `${etaMinutes} mins`
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Last GPS Update
                                </p>
                                <p className="font-semibold text-foreground">
                                    {new Date(
                                        mechanicLocation.updatedAt
                                    ).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Waiting for the mechanic&apos;s live location…
                        </p>
                    )}
                </section>
            )}

            {/* Vehicle Inspection */}
            {inspection && <InspectionDetailsCard inspection={inspection} />}

            {/* Cost Estimate Breakdown & Approval/Rejection */}
            {latestEstimate && (
                <EstimateBreakdownCard
                    estimate={latestEstimate}
                    history={estimateHistory ?? []}
                    canCustomerRespond={
                        request.status !== "cancelled" &&
                        request.status !== "completed" &&
                        latestEstimate.status === "submitted"
                    }
                    onApprove={handleApproveEstimate}
                    onReject={handleRejectEstimate}
                />
            )}

            {/* Combined Payment Panel */}
            {latestEstimate &&
                (latestEstimate.status === "approved" ||
                    latestEstimate.status === "paid" ||
                    payment) && (
                    <EmergencyPaymentPanel
                        requestId={request.id ?? request._id ?? requestId ?? ""}
                        estimate={latestEstimate}
                        payment={payment ?? null}
                        customerPrefill={{
                            ...(user?.fullName ? { name: user.fullName } : {}),
                            ...(user?.email ? { email: user.email } : {}),
                        }}
                        onPaymentVerified={async () => {
                            await fetchStatus();
                        }}
                    />
                )}

            {/* Repair Progress */}
            {repair && (
                <RepairProgressSection repair={repair} isMechanic={false} />
            )}

            {/* Completed Service Report & Invoice */}
            {request.status === "completed" && serviceReport && (
                <EmergencyServiceReportCard report={serviceReport} />
            )}

            {/* Request & Vehicle Details */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                        Request &amp; Vehicle Details
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {vehicleDetails && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/30 p-3 text-xs">
                            <Car className="mt-0.5 size-4 shrink-0 text-primary" />
                            <div>
                                <p className="font-semibold text-foreground">
                                    {vehicleDetails.brand}{" "}
                                    {vehicleDetails.model}{" "}
                                    {vehicleDetails.year
                                        ? `(${vehicleDetails.year})`
                                        : ""}
                                </p>
                                <p className="font-mono text-muted-foreground">
                                    {vehicleDetails.registrationNumber} •{" "}
                                    <span className="capitalize">
                                        {vehicleDetails.vehicleType}
                                    </span>
                                    {vehicleDetails.fuelType
                                        ? ` • ${vehicleDetails.fuelType}`
                                        : ""}
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Issue Category
                        </p>
                        <p className="mt-0.5 font-medium">
                            {ISSUE_LABELS[request.emergencyIssueCategory] ??
                                request.emergencyIssueCategory}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Issue Title
                        </p>
                        <p className="mt-0.5 font-medium">
                            {request.issueTitle}
                        </p>
                    </div>

                    {request.issueDescription && (
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Description
                            </p>
                            <p className="mt-0.5 text-sm">
                                {request.issueDescription}
                            </p>
                        </div>
                    )}

                    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div>
                            <p className="text-xs font-medium">Your Location</p>
                            <p className="mt-0.5 break-all text-xs text-muted-foreground">
                                {request.location.address ??
                                    `${request.location.latitude.toFixed(4)}, ${request.location.longitude.toFixed(4)}`}
                            </p>
                        </div>
                    </div>

                    {request.issueImages.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Issue Photos ({request.issueImages.length})
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {request.issueImages.map((src, idx) => (
                                    <img
                                        key={`${src}-${idx}`}
                                        src={src}
                                        alt={`Emergency issue photo ${idx + 1}`}
                                        className="h-24 w-full rounded-lg border border-border object-cover"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {request.createdAt && (
                        <p className="text-xs text-muted-foreground">
                            Submitted on{" "}
                            {new Date(request.createdAt).toLocaleString()}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
