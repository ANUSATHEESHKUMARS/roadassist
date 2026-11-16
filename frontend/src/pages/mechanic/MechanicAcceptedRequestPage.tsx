import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mechanicEmergencyService } from "@/services/mechanic/mechanicEmergencyService";
import type { EmergencyRequestStatus, EmergencyRequestStatusResponse, MechanicAssignedRequestResponse } from "@/types/emergencyRequest";
import useMechanicLocation from "@/hooks/useMechanicLocation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmergencyLocationMap from "@/components/emergency/EmergencyLocationMap";

import {
    MapPin,
    Clock,
    CheckCircle2,
    Loader2,
    AlertTriangle,
    UserRound,
    ArrowLeft,
    Wrench,
    Image as ImageIcon,
    Navigation
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

export default function MechanicAcceptedRequestPage() {
    const { requestId } = useParams<{ requestId: string }>();
const [startingTravel, setStartingTravel] = useState(false);
const [confirmingArrival, setConfirmingArrival] = useState(false);
    const [data, setData] = useState<MechanicAssignedRequestResponse | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
const {
    location,
    error: locationError,
    isTracking
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

    const handleStartTravel = async () => {
    if (!requestId) return;

    try {
        setStartingTravel(true);

        const updatedRequest =
            await mechanicEmergencyService.startTravel(requestId);

        setData((previous) => {
            if (!previous) return previous;

            return {
                ...previous,
                request: updatedRequest,
            };
        });

    } catch (error) {
        console.error("Failed to start travel:", error);
    } finally {
        setStartingTravel(false);
    }
};
const handleConfirmArrival = async () => {
    if (!requestId) return;

    try {
        setConfirmingArrival(true);

        const updatedRequest =
            await mechanicEmergencyService.confirmArrival(requestId);

        setData((previous) => {
            if (!previous) return previous;

            return {
                ...previous,
                request: updatedRequest,
            };
        });

    } catch (error) {
        console.error("Failed to confirm arrival:", error);
        setError("Unable to confirm arrival. Please try again.");
    } finally {
        setConfirmingArrival(false);
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

const { request } = data;
const statusCfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.assigned;


return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">

        {/* Back */}
        <Link to="/mechanic/service-requests">
            <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Service Requests
            </Button>
        </Link>

        {/* Request Status */}
        <Card className={statusCfg.border}>
            <CardContent className="p-5">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex size-12 items-center justify-center rounded-xl ${statusCfg.bg}`}
                    >
                        <CheckCircle2 className={`size-6 ${statusCfg.color}`} />
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
                                Start your journey to the customer's location.
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
                        Your current location is being tracked.
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

        {/* Travelling Information */}
        {request.status === "on_the_way" && (
            <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="flex items-start gap-3 p-5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                        <Navigation className="size-5 text-blue-400" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-400">
                            You're on your way!
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your travel has started. Head towards the customer's location.
                        </p>
                    </div>
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
                                Confirm your arrival once you reach the customer's location.
                            </p>
                        </div>
                    </div>

                    <Button
                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
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

        {/* Arrived Confirmation */}
        {request.status === "arrived" && (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="space-y-4 p-5">

                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                            <CheckCircle2 className="size-6 text-emerald-400" />
                        </div>

                        <div>
                            <h3 className="font-semibold text-emerald-400">
                                You've Arrived!
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                You have successfully reached the customer's location.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <p className="text-sm font-medium text-emerald-400">
                            Arrival Confirmed
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            You can now proceed with the vehicle inspection.
                        </p>
                    </div>

                    <Button
                        className="w-full gap-2"
                        disabled
                    >
                        <Wrench className="size-4" />
                        Vehicle Inspection (Coming Next)
                    </Button>

                </CardContent>
            </Card>
        )}

        {/* Customer Info */}
        {data.customerDetails && (
            <Card className="border-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <UserRound className="size-4 text-primary" />
                        Customer Details
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted">
                            <UserRound className="size-5 text-muted-foreground" />
                        </div>

                        <div>
                            <p className="font-semibold">
                                {data.customerDetails.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {data.customerDetails.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {data.customerDetails.phoneNumber}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Request Details */}
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Wrench className="size-4 text-primary" />
                    Request Details
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

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

                {/* Customer Location */}
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

                {/* Images */}
                {request.issueImages.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="size-4" />
                        <span>
                            {request.issueImages.length} photo
                            {request.issueImages.length > 1 ? "s" : ""} attached
                        </span>
                    </div>
                )}

                {/* Timestamp */}
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