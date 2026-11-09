import { useCallback, useEffect, useState } from "react";
import type { EmergencyRequestDetail } from "@/types/emergencyRequest";
import { mechanicEmergencyService } from "@/services/mechanic/mechanicEmergencyService";
import { useToast } from "@/components/ui/toast/ToastProvider";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
    RefreshCw,
    Wrench,
} from "lucide-react";

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

function timeAgo(dateStr?: string): string {
    if (!dateStr) return "";
    const seconds = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / 1000
    );
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function MechanicServiceRequestsPage() {
    const { showToast } = useToast();

    const [requests, setRequests] = useState<EmergencyRequestDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await mechanicEmergencyService.getNearbyRequests();
            setRequests(data);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ??
                "Failed to load nearby requests. Make sure you are online.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchRequests();

        // Auto-refresh every 15 seconds
        const interval = setInterval(() => {
            void fetchRequests();
        }, 15_000);

        return () => clearInterval(interval);
    }, [fetchRequests]);

    const handleAccept = async (requestId: string) => {
        setActionLoading(requestId);

        try {
            await mechanicEmergencyService.acceptRequest(requestId);
            showToast("Emergency request accepted successfully!", "success");

            // Remove from list
            setRequests((prev) =>
                prev.filter((r) => (r.id ?? r._id) !== requestId)
            );
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ??
                "Failed to accept request. It may have been taken by another mechanic.";
            showToast(message, "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (requestId: string) => {
        setActionLoading(requestId);

        try {
            await mechanicEmergencyService.rejectRequest(requestId);
            showToast("Request rejected.", "info");

            // Remove from list
            setRequests((prev) =>
                prev.filter((r) => (r.id ?? r._id) !== requestId)
            );
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? "Failed to reject request.";
            showToast(message, "error");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Nearby Service Requests
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Emergency requests within your 5 km service radius
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRequests}
                    disabled={loading}
                    className="gap-2"
                >
                    <RefreshCw
                        className={`size-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                    <div>
                        <p className="text-sm font-medium text-destructive">
                            {error}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Make sure your location is enabled and you are
                            online from the Dashboard.
                        </p>
                    </div>
                </div>
            )}

            {/* Loading skeleton */}
            {loading && requests.length === 0 && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <span className="ml-3 text-sm text-muted-foreground">
                        Loading nearby requests…
                    </span>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && requests.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <Wrench className="size-6 text-muted-foreground" />
                        </div>

                        <p className="mt-4 font-semibold">
                            No nearby requests right now
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            There are no emergency requests within your 5 km
                            radius. New requests will appear here automatically.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Request Cards */}
            <div className="grid gap-4 lg:grid-cols-2">
                {requests.map((request) => {
                    const requestId =
                        request.id ?? request._id ?? "";
                    const isActioning = actionLoading === requestId;

                    return (
                        <Card
                            key={requestId}
                            className="border-border transition-colors hover:border-primary/30"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-base">
                                            {request.issueTitle}
                                        </CardTitle>

                                        <span className="mt-1 inline-flex rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                                            {ISSUE_LABELS[
                                                request.emergencyIssueCategory
                                            ] ??
                                                request.emergencyIssueCategory}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        {timeAgo(request.createdAt)}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Description */}
                                {request.issueDescription && (
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {request.issueDescription}
                                    </p>
                                )}

                                {/* Location */}
                                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium">
                                            Customer Location
                                        </p>
                                        <p className="mt-0.5 break-all text-xs text-muted-foreground">
                                            {request.location.address ??
                                                `${request.location.latitude.toFixed(4)}, ${request.location.longitude.toFixed(4)}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Images count */}
                                {request.issueImages.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        📷 {request.issueImages.length} photo
                                        {request.issueImages.length > 1
                                            ? "s"
                                            : ""}{" "}
                                        attached
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 border-t border-border pt-3">
                                    <Button
                                        size="sm"
                                        className="flex-1 gap-2"
                                        disabled={isActioning}
                                        onClick={() =>
                                            handleAccept(requestId)
                                        }
                                    >
                                        {isActioning ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="size-4" />
                                        )}
                                        Accept
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-2"
                                        disabled={isActioning}
                                        onClick={() =>
                                            handleReject(requestId)
                                        }
                                    >
                                        <XCircle className="size-4" />
                                        Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

