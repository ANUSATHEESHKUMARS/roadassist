import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mechanicEmergencyService } from "@/services/mechanic/mechanicEmergencyService";
import type { EmergencyRequestStatusResponse } from "@/types/emergencyRequest";

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
    Loader2,
    AlertTriangle,
    UserRound,
    ArrowLeft,
    Wrench,
    Image as ImageIcon,
} from "lucide-react";

const STATUS_CONFIG: Record<
    string,
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

    const [data, setData] = useState<EmergencyRequestStatusResponse | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRequest = useCallback(async () => {
        if (!requestId) return;

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

            {/* Status Header */}
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
                            <p
                                className={`text-lg font-bold ${statusCfg.color}`}
                            >
                                {statusCfg.label}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Customer Info (from mechanicDetails — this is actually the user's details when viewed by mechanic) */}
            {data.mechanicDetails && (
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
                                    {data.mechanicDetails.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {data.mechanicDetails.email}
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

                    {/* Location */}
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
                                {request.issueImages.length > 1 ? "s" : ""}{" "}
                                attached
                            </span>
                        </div>
                    )}

                    {/* Timestamps */}
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

