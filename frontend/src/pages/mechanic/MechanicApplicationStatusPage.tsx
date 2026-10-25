
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import {
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    FileText,
    RefreshCw,
    Wrench,
    Loader2,
    ArrowRight,
    MapPin,
    ShieldCheck,
} from "lucide-react";

import { useToast } from "@/components/ui/toast/ToastProvider";

import {
    getMyMechanicApplication,
} from "@/services/mechanic/mechanicApplicaitonService";
import type { MyMechanicApplicationResponse } from "@/services/mechanic/mechanicApplicaitonService";

type ApplicationData = NonNullable<MyMechanicApplicationResponse["data"]>;

const statusConfig: Record<string, {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
}> = {
    incomplete: {
        label: "Incomplete",
        icon: <AlertCircle className="h-5 w-5" />,
        color: "text-gray-400",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/20",
        description: "Your application is saved as a draft. Complete all required fields and submit for review.",
    },
    pending: {
        label: "Pending Review",
        icon: <Clock className="h-5 w-5" />,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        description: "Your application has been submitted and is waiting to be reviewed by our admin team.",
    },
    under_review: {
        label: "Under Review",
        icon: <ShieldCheck className="h-5 w-5" />,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        description: "An admin is currently reviewing your application. You'll be notified when a decision is made.",
    },
    changes_requested: {
        label: "Changes Requested",
        icon: <AlertCircle className="h-5 w-5" />,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        description: "The admin has requested changes to your application. Please update and resubmit.",
    },
    approved: {
        label: "Approved",
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        description: "Congratulations! Your mechanic application has been approved. You now have mechanic access.",
    },
    rejected: {
        label: "Rejected",
        icon: <XCircle className="h-5 w-5" />,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        description: "Unfortunately, your application has been rejected. Check the reason below for details.",
    },
};

const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

export default function MechanicApplicationStatusPage() {
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState<ApplicationData | null>(null);

    const fetchApplication = useCallback(async () => {
        setLoading(true);

        try {
            const response = await getMyMechanicApplication();
            setApplication(response.data ?? null);
        } catch (error) {
            console.error("Failed to fetch application status:", error);
            showToast("Failed to load application status.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void fetchApplication();
    }, [fetchApplication]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading application status...</span>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center space-y-5">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                        <Wrench className="h-8 w-8 text-primary" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Become a Mechanic
                        </h2>

                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            You haven't started a mechanic application yet.
                            Apply now to join our network of verified mechanics.
                        </p>
                    </div>

                    <Link
                        to="/mechanic/onboarding"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Start Application
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const config = statusConfig[application.status] ?? statusConfig.incomplete;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wrench className="h-4 w-4" />
                        Mechanic Application
                    </div>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight">
                        Application Status
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={() => void fetchApplication()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Status Card */}
            <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-6`}>
                <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center shrink-0 ${config.color}`}>
                        {config.icon}
                    </div>

                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-bold">{config.label}</h2>

                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.bgColor} ${config.color}`}>
                                {application.status.replace(/_/g, " ").toUpperCase()}
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {config.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Rejection / Review Reason */}
            {application.reviewReason && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                    <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />

                        <div>
                            <h3 className="text-sm font-semibold text-red-500">
                                Review Reason
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                {application.reviewReason}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Application Details */}
            <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border p-4">
                    <h3 className="text-sm font-semibold">Application Details</h3>
                </div>

                <div className="p-4 sm:p-5 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <DetailItem label="Application ID" value={application.id} />
                        <DetailItem label="Experience" value={application.experienceYears ? `${application.experienceYears} years` : undefined} />
                        <DetailItem label="Service Model" value={application.serviceModel} />
                        <DetailItem label="PIN Code" value={application.pincode} />
                        <DetailItem
                            label="Service Address"
                            value={application.serviceAddress}
                            icon={<MapPin className="h-4 w-4" />}
                        />
                        <DetailItem label="Workshop Name" value={application.workshopName} />
                        <DetailItem label="Workshop Address" value={application.workshopAddress} />
                        <DetailItem label="Submitted At" value={formatDate(application.submittedAt)} />
                        <DetailItem label="Reviewed At" value={formatDate(application.reviewedAt)} />

                        <DetailItem
                            label="Specializations"
                            value={(application.specializations ?? []).join(", ") || undefined}
                        />

                        <DetailItem
                            label="Supported Vehicles"
                            value={(application.supportedVehicleTypes ?? []).join(", ") || undefined}
                        />

                        <DetailItem
                            label="Services Offered"
                            value={(application.serviceOffered ?? []).join(", ") || undefined}
                        />
                    </div>

                    {application.professionalDescription && (
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                                Professional Description
                            </p>
                            <p className="text-sm whitespace-pre-wrap">
                                {application.professionalDescription}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Documents */}
            {(application.documents ?? []).length > 0 && (
                <div className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border p-4">
                        <h3 className="text-sm font-semibold">Submitted Documents</h3>
                    </div>

                    <div className="divide-y divide-border">
                        {(application.documents ?? []).map((doc, index) => (
                            <div
                                key={`${doc.documentType}-${index}`}
                                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />

                                    <div>
                                        <p className="text-sm font-medium capitalize">
                                            {doc.documentType.replace(/_/g, " ")}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {doc.originalName}
                                        </p>
                                    </div>
                                </div>

                                <span className={`text-xs font-medium ${
                                    doc.verificationStatus === "verified"
                                        ? "text-emerald-500"
                                        : doc.verificationStatus === "rejected"
                                            ? "text-red-500"
                                            : "text-amber-500"
                                }`}>
                                    {doc.verificationStatus.charAt(0).toUpperCase() + doc.verificationStatus.slice(1)}
                                </span>

                                {doc.rejectionReason && (
                                    <p className="text-xs text-red-500 sm:col-span-2">
                                        {doc.rejectionReason}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action buttons */}
            {(application.status === "incomplete" || application.status === "changes_requested") && (
                <div className="flex justify-end">
                    <Link
                        to="/mechanic/onboarding"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        {application.status === "changes_requested" ? "Update Application" : "Continue Application"}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}

function DetailItem({
    label,
    value,
    icon,
}: {
    label: string;
    value?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>

            <div className="flex items-start gap-2 text-sm">
                {icon}
                <span className="break-words">{value || "—"}</span>
            </div>
        </div>
    );
}
