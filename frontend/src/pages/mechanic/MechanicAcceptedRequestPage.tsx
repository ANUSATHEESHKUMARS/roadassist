import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mechanicEmergencyService } from "@/services/mechanic/mechanicEmergencyService";
import type {
    EmergencyRequestStatus,
    EmergencyServiceReport,
    MechanicAssignedRequestResponse,
    RepairPartUsed,
} from "@/types/emergencyRequest";
import useMechanicLocation from "@/hooks/useMechanicLocation";
import { useEmergencyVideoCall } from "@/context/EmergencyVideoCallContext";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { getApiErrorMessage } from "@/api/apiError";
import { socket } from "@/services/socket/socket";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmergencyLocationMap from "@/components/emergency/EmergencyLocationMap";
import { MechanicInspectionForm } from "@/components/emergency/MechanicInspectionForm";
import { MechanicEstimateForm } from "@/components/emergency/MechanicEstimateForm";
import { EstimateBreakdownCard } from "@/components/emergency/EstimateBreakdownCard";
import { RepairProgressSection } from "@/components/emergency/RepairProgressSection";
import { EmergencyServiceReportCard } from "@/components/emergency/EmergencyServiceReportCard";

import {
    MapPin,
    Clock,
    CheckCircle2,
    Loader2,
    AlertTriangle,
    UserRound,
    ArrowLeft,
    Wrench,
    Navigation,
    Video,
    ExternalLink,
    Phone,
    Car,
    ShieldCheck,
} from "lucide-react";

const STATUS_CONFIG: Record<
    EmergencyRequestStatus,
    { label: string; color: string; bg: string; border: string }
> = {
    pending: {
        label: "Pending",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },
    searching: {
        label: "Searching",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    assigned: {
        label: "Assigned to You",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
    on_the_way: {
        label: "On the Way",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    arrived: {
        label: "Arrived at Customer Location",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
    completed: {
        label: "Completed",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
    cancelled: {
        label: "Cancelled",
        color: "text-muted-foreground",
        bg: "bg-muted",
        border: "border-border",
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

const MECHANIC_SYNC_EVENTS = [
    "emergency_status_updated",
    "emergency_estimate_updated",
    "emergency_payment_updated",
    "emergency_request_cancelled",
] as const;

export default function MechanicAcceptedRequestPage() {
    const { requestId } = useParams<{ requestId: string }>();
    const { showToast } = useToast();
    const { startVideoCall, phase: callPhase } = useEmergencyVideoCall();

    const [startingTravel, setStartingTravel] = useState(false);
    const [confirmingArrival, setConfirmingArrival] = useState(false);
    const [data, setData] = useState<MechanicAssignedRequestResponse | null>(
        null
    );
    const [serviceReport, setServiceReport] =
        useState<EmergencyServiceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const {
        location,
        error: locationError,
        isTracking,
    } = useMechanicLocation(
        data?.request.status === "on_the_way",
        requestId
    );

    const fetchRequest = useCallback(async () => {
        if (!requestId) {
            setError("Emergency request ID is missing.");
            setLoading(false);
            return;
        }

        try {
            const result =
                await mechanicEmergencyService.getAssignedRequest(requestId);
            setData(result);
            setError("");
        } catch {
            setError("Unable to load request details.");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        void fetchRequest();
    }, [fetchRequest]);

    useEffect(() => {
        if (!requestId) return;

        const handleConnect = () => {
            void fetchRequest();
        };

        const handleSyncEvent = (payload?: {
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
            void fetchRequest();
        };

        socket.on("connect", handleConnect);
        MECHANIC_SYNC_EVENTS.forEach((eventName) => {
            socket.on(eventName, handleSyncEvent);
        });

        return () => {
            socket.off("connect", handleConnect);
            MECHANIC_SYNC_EVENTS.forEach((eventName) => {
                socket.off(eventName, handleSyncEvent);
            });
        };
    }, [requestId, fetchRequest]);

    useEffect(() => {
        if (!requestId || data?.request.status !== "completed") {
            return;
        }
        let active = true;
        mechanicEmergencyService
            .getServiceReport(requestId)
            .then((report) => {
                if (active) setServiceReport(report);
            })
            .catch(() => {
                // Report load error falls back to completed status view
            });
        return () => {
            active = false;
        };
    }, [requestId, data?.request.status]);

    const handleStartTravel = async () => {
        if (!requestId) return;

        try {
            setStartingTravel(true);
            await mechanicEmergencyService.startTravel(requestId);
            await fetchRequest();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setStartingTravel(false);
        }
    };

    const handleConfirmArrival = async () => {
        if (!requestId) return;

        try {
            setConfirmingArrival(true);
            await mechanicEmergencyService.confirmArrival(requestId);
            await fetchRequest();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setConfirmingArrival(false);
        }
    };

    const handleStartRepair = async () => {
        if (!requestId) return;
        try {
            await mechanicEmergencyService.startRepair(requestId);
            showToast("Repair work started.", "success");
            await fetchRequest();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        }
    };

    const handleLogRepairProgress = async (note: string) => {
        if (!requestId) return;
        try {
            await mechanicEmergencyService.logRepairProgress(requestId, note);
            showToast("Progress update logged.", "success");
            await fetchRequest();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        }
    };

    const handleCompleteRepair = async (payload: {
        workPerformed: string;
        partsUsed: RepairPartUsed[];
    }) => {
        if (!requestId) return;
        try {
            await mechanicEmergencyService.completeRepair(requestId, payload);
            showToast(
                "Repair completed and service invoice generated.",
                "success"
            );
            await fetchRequest();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">
                    Loading request details…
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

                <Link to="/mechanic/service-requests">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="size-4" />
                        Back to Service Requests
                    </Button>
                </Link>
            </div>
        );
    }

    const {
        request,
        customerDetails,
        vehicleDetails,
        inspection,
        latestEstimate,
        estimateHistory,
        payment,
        repair,
    } = data;
    const statusCfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.assigned;
    const resolvedRequestId = request.id ?? request._id ?? requestId ?? "";

    // Video call strictly allowed ONLY after mechanic acceptance and before completion/cancellation
    const canStartVideoCall = ["assigned", "on_the_way", "arrived"].includes(
        request.status
    );
    const canStartRepair =
        latestEstimate?.status === "paid" || payment?.status === "paid";
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${request.location.latitude},${request.location.longitude}`;

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link to="/mechanic/service-requests">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="size-4" />
                        Back to Service Requests
                    </Button>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <ExternalLink className="size-3.5" />
                            Open in Google Maps
                        </Button>
                    </a>

                    {canStartVideoCall && (
                        <Button
                            type="button"
                            size="sm"
                            disabled={callPhase !== "idle"}
                            onClick={() =>
                                void startVideoCall(
                                    resolvedRequestId,
                                    customerDetails?.fullName
                                )
                            }
                            className="gap-1.5"
                        >
                            <Video className="size-3.5" />
                            {callPhase === "idle"
                                ? "Call Customer"
                                : "Call Active"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Request Status */}
            <Card className={statusCfg.border}>
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div
                            className={`flex size-12 items-center justify-center rounded-xl ${statusCfg.bg}`}
                        >
                            <CheckCircle2
                                className={`size-6 ${statusCfg.color}`}
                            />
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

                    {request.status === "cancelled" &&
                        request.cancellationReason && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Cancellation reason: {request.cancellationReason}
                            </p>
                        )}
                </CardContent>
            </Card>

            {/* Start Travel */}
            {request.status === "assigned" && (
                <Card className="border-primary/20">
                    <CardContent className="space-y-4 p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <Navigation className="size-5 text-primary" />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Ready to travel?
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Start your journey to the customer&apos;s
                                    location and share live GPS tracking.
                                </p>
                            </div>
                        </div>

                        <Button
                            className="w-full gap-2"
                            onClick={handleStartTravel}
                            disabled={startingTravel}
                        >
                            {startingTravel ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Starting Travel...
                                </>
                            ) : (
                                <>
                                    <Navigation className="size-4" />
                                    Start Travel
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Live Location Tracking */}
            {request.status === "on_the_way" && (
                <Card className="border-blue-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Navigation className="size-5 text-blue-400" />
                            Live Location Tracking
                        </CardTitle>

                        <p className="text-sm text-muted-foreground">
                            Your current location is being shared with the
                            customer.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {locationError ? (
                            <div className="rounded-lg bg-destructive/10 p-3">
                                <p className="text-sm text-destructive">
                                    {locationError}
                                </p>
                            </div>
                        ) : location ? (
                            <>
                                <div className="overflow-hidden rounded-xl border">
                                    <EmergencyLocationMap
                                        location={{
                                            latitude: location.latitude,
                                            longitude: location.longitude,
                                        }}
                                        onLocationChange={() => {}}
                                        readOnly
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            GPS Accuracy
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {Math.round(location.accuracy)} meters
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Tracking Status
                                        </p>
                                        <p className="mt-1 font-semibold text-emerald-500">
                                            {isTracking ? "Active" : "Inactive"}
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
                                <Loader2 className="size-7 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">
                                    Waiting for GPS location...
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Confirm Arrival */}
            {request.status === "on_the_way" && (
                <Card className="border-emerald-500/20">
                    <CardContent className="space-y-4 p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                                <MapPin className="size-5 text-emerald-400" />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Reached Customer Location?
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Confirm your arrival once you reach the
                                    customer&apos;s location.
                                </p>
                            </div>
                        </div>

                        <Button
                            className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={handleConfirmArrival}
                            disabled={confirmingArrival}
                        >
                            {confirmingArrival ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Confirming Arrival...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="size-4" />
                                    Confirm Arrival
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Post-Arrival On-Site Service Workflow: Inspection -> Estimate -> Payment -> Repair */}
            {request.status === "arrived" && (
                <div className="space-y-5">
                    <MechanicInspectionForm
                        requestId={resolvedRequestId}
                        inspection={inspection ?? null}
                        onUpdated={fetchRequest}
                    />

                    {inspection?.status === "completed" && (
                        <>
                            <MechanicEstimateForm
                                requestId={resolvedRequestId}
                                latestEstimate={latestEstimate ?? null}
                                onUpdated={fetchRequest}
                            />

                            {latestEstimate &&
                                latestEstimate.status !== "rejected" && (
                                    <EstimateBreakdownCard
                                        estimate={latestEstimate}
                                        history={estimateHistory ?? []}
                                    />
                                )}
                        </>
                    )}

                    {latestEstimate?.status === "approved" && !canStartRepair && (
                        <Card className="border-amber-500/30 bg-amber-500/5">
                            <CardContent className="flex items-center gap-3 p-4 text-xs text-amber-400">
                                <Clock className="size-4 shrink-0" />
                                <span>
                                    Customer approved estimate (₹
                                    {latestEstimate.totalAmount.toFixed(2)}).
                                    Waiting for customer Razorpay payment before
                                    repair can start.
                                </span>
                            </CardContent>
                        </Card>
                    )}

                    {canStartRepair && (
                        <Card className="border-emerald-500/30 bg-emerald-500/5">
                            <CardContent className="flex items-center gap-3 p-4 text-xs text-emerald-400">
                                <ShieldCheck className="size-4 shrink-0" />
                                <span>
                                    Customer payment verified (₹
                                    {(
                                        payment?.amount ??
                                        latestEstimate?.totalAmount ??
                                        0
                                    ).toFixed(2)}
                                    ). You are authorized to start the repair.
                                </span>
                            </CardContent>
                        </Card>
                    )}

                    <RepairProgressSection
                        repair={repair ?? null}
                        isMechanic
                        canStartRepair={canStartRepair}
                        onStartRepair={handleStartRepair}
                        onLogProgress={handleLogRepairProgress}
                        onCompleteRepair={handleCompleteRepair}
                    />
                </div>
            )}

            {/* Completed Service Report */}
            {request.status === "completed" && serviceReport && (
                <EmergencyServiceReportCard report={serviceReport} />
            )}

            {/* Customer Info */}
            {customerDetails && (
                <Card className="border-primary/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserRound className="size-4 text-primary" />
                            Customer Details
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted">
                                    <UserRound className="size-5 text-muted-foreground" />
                                </div>

                                <div>
                                    <p className="font-semibold">
                                        {customerDetails.fullName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {customerDetails.email}
                                    </p>
                                    <a
                                        href={`tel:${customerDetails.phoneNumber}`}
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        <Phone className="size-3" />
                                        {customerDetails.phoneNumber}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Request & Vehicle Details */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Wrench className="size-4 text-primary" />
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
                            <p className="text-xs font-medium">
                                Customer Location
                            </p>
                            <p className="mt-0.5 break-all text-xs text-muted-foreground">
                                {request.location.address ??
                                    `${request.location.latitude.toFixed(4)}, ${request.location.longitude.toFixed(4)}`}
                            </p>
                        </div>
                    </div>

                    {request.issueImages.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Customer Photos ({request.issueImages.length})
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {request.issueImages.map((src, idx) => (
                                    <img
                                        key={`${src}-${idx}`}
                                        src={src}
                                        alt={`Customer issue photo ${idx + 1}`}
                                        className="h-24 w-full rounded-lg border border-border object-cover"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {request.createdAt && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            <span>
                                Submitted on{" "}
                                {new Date(request.createdAt).toLocaleString()}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
