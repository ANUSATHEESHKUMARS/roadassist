
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    LoaderCircle,
    MapPin,
    RefreshCw,
    Search,
    ShieldCheck,
    Wrench,
    XCircle,
} from "lucide-react";

import { useToast } from "@/components/ui/toast/ToastProvider";

import {
    getMechanicApplications,
    approveMechanicApplication,
    rejectMechanicApplication,
} from "@/services/admin/adminMechanicService";

import type {
    MechanicApplication,
    MechanicApplicationStatus,
} from "@/services/admin/adminMechanicService";
import ConfirmActionModal from "@/components/admin/layout/ConfirmActionModal";

const statuses: MechanicApplicationStatus[] = [
    "pending",
    "under_review",
    "approved",
    "rejected",
    "changes_requested",
    "incomplete",
];

const statusStyles: Record<MechanicApplicationStatus, string> = {
    incomplete: "bg-muted text-muted-foreground",
    pending: "bg-amber-500/10 text-amber-600",
    under_review: "bg-blue-500/10 text-blue-600",
    changes_requested: "bg-orange-500/10 text-orange-600",
    approved: "bg-emerald-500/10 text-emerald-600",
    rejected: "bg-red-500/10 text-red-600",
};

const formatStatus = (status?: string | null) => {
    if (!status) return "Unknown";

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString();
};


type PendingAction = {
    applicationId: string;
    action: "approve" | "reject";
} | null;

export default function MechanicApplicationsPage() {
    const { showToast } = useToast();

    const [applications, setApplications] = useState<
        MechanicApplication[]
    >([]);

    const [status, setStatus] =
        useState<MechanicApplicationStatus>("pending");

    const [pendingAction, setPendingAction] =
        useState<PendingAction>(null);
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchApplications = useCallback(async () => {
        setLoading(true);

        try {
            const response = await getMechanicApplications(status);
            setApplications(response.data ?? []);
        } catch (error) {
            console.error("Failed to load mechanic applications:", error);
            showToast("Failed to load mechanic applications.", "error");
        } finally {
            setLoading(false);
        }
    }, [status, showToast]);

    useEffect(() => {
        void fetchApplications();
    }, [fetchApplications]);


const approveApplication = async (applicationId: string) => {
    setActionId(applicationId);

    try {
        await approveMechanicApplication(applicationId);

        showToast("Mechanic application approved.", "success");
        setExpandedId(null);

        // Close the confirmation modal after success
        setPendingAction(null);

        // Refresh the application list
        await fetchApplications();
    } catch (error) {
        console.error("Failed to approve application:", error);
        showToast("Unable to approve this application.", "error");
    } finally {
        setActionId(null);
    }
};


    const rejectApplication = async () => {
        if (!rejectingId || !rejectionReason.trim()) {
            showToast("Please enter a rejection reason.", "error");
            return;
        }

        const applicationId = rejectingId;
        setActionId(applicationId);

        try {
            await rejectMechanicApplication(
                applicationId,
                rejectionReason.trim()
            );

            showToast("Mechanic application rejected.", "success");

            setRejectingId(null);
            setRejectionReason("");
            setExpandedId(null);

            await fetchApplications();
        } catch (error) {
            console.error("Failed to reject application:", error);
            showToast("Unable to reject this application.", "error");
        } finally {
            setActionId(null);
        }
    };

    const filteredApplications = applications.filter((application) => {
        const query = search.trim().toLowerCase();

        return (
            !query ||
            (application.userId ?? "").toLowerCase().includes(query) ||
            (application.id ?? "").toLowerCase().includes(query) ||
            (application.workshopName ?? "").toLowerCase().includes(query) ||
            (application.serviceAddress ?? "").toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wrench className="h-4 w-4" />
                        Admin / Mechanic Management
                    </div>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight">
                        Mechanic Applications
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Review applications and manage mechanic onboarding.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void fetchApplications()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                    icon={<Clock className="h-5 w-5" />}
                    label="Applications in this view"
                    value={applications.length}
                />

                <SummaryCard
                    icon={<FileText className="h-5 w-5" />}
                    label="Documents submitted"
                    value={applications.reduce(
                        (total, application) =>
                            total + (application.documents?.length ?? 0),
                        0
                    )}
                />

                <SummaryCard
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label="Current filter"
                    value={formatStatus(status)}
                />
            </div>

            <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                            {statuses.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => {
                                        setStatus(item);
                                        setExpandedId(null);
                                    }}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${status === item
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {formatStatus(item)}
                                </button>
                            ))}
                        </div>

                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search application, user or address..."
                                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Loading applications...
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 p-12 text-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />

                        <p className="font-medium">No applications found</p>

                        <p className="text-sm text-muted-foreground">
                            There are no matching applications for this status.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filteredApplications.map((application) => {
                            const expanded = expandedId === application.id;
                            const busy = actionId === application.id;

                            return (
                                <div key={application.id} className="p-4 sm:p-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold">
                                                    {application.workshopName || "Mechanic applicant"}
                                                </span>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]
                                                        }`}
                                                >
                                                    {formatStatus(application.status)}
                                                </span>
                                            </div>

                                            <p className="break-all text-xs text-muted-foreground">
                                                Application ID: {application.id}
                                            </p>

                                            <p className="break-all text-xs text-muted-foreground">
                                                User ID: {application.userId}
                                            </p>

                                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                                <span>
                                                    Experience: {application.experienceYears ?? "—"} years
                                                </span>

                                                <span>
                                                    Service: {application.serviceModel ?? "—"}
                                                </span>

                                                <span>
                                                    Documents: {application.documents?.length ?? 0}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedId(expanded ? null : application.id)
                                            }
                                            className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                                        >
                                            {expanded ? "Hide details" : "View details"}
                                        </button>
                                    </div>

                                    {expanded && (
                                        <div className="mt-5 space-y-5 rounded-xl bg-muted/30 p-4">
                                            <section className="grid gap-4 sm:grid-cols-2">
                                                <Detail
                                                    label="Service address"
                                                    value={application.serviceAddress}
                                                    icon={<MapPin className="h-4 w-4" />}
                                                />

                                                <Detail
                                                    label="Workshop address"
                                                    value={application.workshopAddress}
                                                />

                                                <Detail
                                                    label="PIN code"
                                                    value={application.pincode}
                                                />

                                                <Detail
                                                    label="Submitted at"
                                                    value={formatDate(application.submittedAt)}
                                                />

                                                <Detail
                                                    label="Specializations"
                                                    value={
                                                        (application.specializations ?? []).join(", ") ||
                                                        "None"
                                                    }
                                                />

                                                <Detail
                                                    label="Supported vehicles"
                                                    value={
                                                        (application.supportedVehicleType ?? []).join(", ") ||
                                                        "None"
                                                    }
                                                />

                                                <Detail
                                                    label="Services offered"
                                                    value={
                                                        (application.serviceOffered ?? []).join(", ") ||
                                                        "None"
                                                    }
                                                />

                                                <Detail
                                                    label="Professional description"
                                                    value={application.professionalDescription}
                                                />
                                            </section>

                                            <section>
                                                <h3 className="mb-3 text-sm font-semibold">
                                                    Submitted documents
                                                </h3>

                                                {(application.documents ?? []).length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        No documents available.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {(application.documents ?? []).map(
                                                            (document, index) => (
                                                                <div
                                                                    key={`${document.documentType}-${index}`}
                                                                    className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />

                                                                        <div>
                                                                            <p className="text-sm font-medium">
                                                                                {document.documentType}
                                                                            </p>

                                                                            <p className="text-xs text-muted-foreground">
                                                                                {document.originalName}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <span className="text-xs text-muted-foreground">
                                                                        Verification:{" "}
                                                                        {formatStatus(document.verificationStatus)}
                                                                    </span>

                                                                    {document.rejectionReason && (
                                                                        <p className="text-xs text-red-600">
                                                                            {document.rejectionReason}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Document metadata is shown here. Secure file viewing
                                                    requires a backend endpoint that returns authorized
                                                    download URLs.
                                                </p>
                                            </section>

                                            {application.reviewReason && (
                                                <p className="text-sm text-muted-foreground">
                                                    Review reason: {application.reviewReason}
                                                </p>
                                            )}

                                            {(application.status === "pending" ||
                                                application.status === "under_review") && (
                                                    <div className="flex flex-wrap gap-3 border-t border-border pt-4">

                                                        <button
                                                            type="button"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                setPendingAction({
                                                                    applicationId: application.id!,
                                                                    action: "approve",
                                                                })
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Approve application
                                                        </button>


                                                        <button
                                                            type="button"
                                                            disabled={busy}
                                                            onClick={() => {
                                                                setRejectingId(application.id);
                                                                setRejectionReason("");
                                                            }}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            Reject application
                                                        </button>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

{pendingAction?.action === "approve" && (
  <ConfirmActionModal
    title="Approve mechanic application?"
    message="Are you sure you want to approve this mechanic? The decision will be saved and reflected on the mechanic's side."
    confirmLabel="Approve application"
    loading={actionId === pendingAction.applicationId}
    onCancel={() => setPendingAction(null)}
    onConfirm={() => {
      void approveApplication(pendingAction.applicationId);
    }}
  />
)}

            {rejectingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reject-title"
                        className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl"
                    >
                        <h2 id="reject-title" className="text-lg font-semibold">
                            Reject mechanic application
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Explain why the application is being rejected. The applicant
                            should be able to understand what needs to be corrected.
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(event) => setRejectionReason(event.target.value)}
                            placeholder="Enter rejection reason..."
                            rows={4}
                            maxLength={1000}
                            className="mt-4 w-full resize-y rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />

                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={actionId === rejectingId}
                                onClick={() => {
                                    setRejectingId(null);
                                    setRejectionReason("");
                                }}
                                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    !rejectionReason.trim() || actionId === rejectingId
                                }
                                onClick={() => void rejectApplication()}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {actionId === rejectingId
                                    ? "Rejecting..."
                                    : "Confirm rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {icon}
                {label}
            </div>

            <p className="mt-3 text-2xl font-bold">{value}</p>
        </div>
    );
}

function Detail({
    label,
    value,
    icon,
}: {
    label: string;
    value?: string;
    icon?: ReactNode;
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
