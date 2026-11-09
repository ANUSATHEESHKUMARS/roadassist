import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { emergencyRequestService } from "@/services/EmergencyRequestPage";
import type { EmergencyRequestDetail } from "@/types/emergencyRequest";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
    Clock,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    RefreshCw,
    Search,
    ChevronRight,
    Wrench,
    ArrowLeft,
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
        label: "Searching",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        icon: Search,
    },
    assigned: {
        label: "Assigned",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: CheckCircle2,
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

export default function UserEmergencyRequestsListPage() {
    const [requests, setRequests] = useState<EmergencyRequestDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await emergencyRequestService.getMyRequests();
            setRequests(data);
        } catch {
            setError("Failed to load your emergency requests.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchRequests();
    }, [fetchRequests]);

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/user">
                        <Button variant="ghost" size="icon" className="size-8">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            My Emergency Requests
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Track the status of your requests
                        </p>
                    </div>
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
                    <p className="text-sm font-medium text-destructive">
                        {error}
                    </p>
                </div>
            )}

            {/* Loading */}
            {loading && requests.length === 0 && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <span className="ml-3 text-sm text-muted-foreground">
                        Loading your requests…
                    </span>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && requests.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <Wrench className="size-6 text-muted-foreground" />
                        </div>

                        <p className="mt-4 font-semibold">
                            No emergency requests yet
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            When you submit an emergency request, it will appear
                            here so you can track its progress.
                        </p>

                        <Link to="/user/emergency" className="mt-4">
                            <Button size="sm" className="gap-2">
                                New Emergency Request
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Request Cards */}
            <div className="space-y-3">
                {requests.map((request) => {
                    const requestId = request.id ?? request._id ?? "";
                    const statusCfg =
                        STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;
                    const StatusIcon = statusCfg.icon;

                    return (
                        <Link
                            key={requestId}
                            to={`/user/emergency-requests/${requestId}`}
                            className="block"
                        >
                            <Card className="border-border transition-colors hover:border-primary/30">
                                <CardHeader className="pb-2">
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

                                        <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex size-6 items-center justify-center rounded-md ${statusCfg.bg}`}
                                            >
                                                <StatusIcon
                                                    className={`size-3.5 ${statusCfg.color}`}
                                                />
                                            </div>
                                            <span
                                                className={`text-sm font-medium ${statusCfg.color}`}
                                            >
                                                {statusCfg.label}
                                            </span>
                                        </div>

                                        {request.createdAt && (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="size-3" />
                                                {new Date(
                                                    request.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

