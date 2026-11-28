import { useState } from "react";
import {
    CheckCircle2,
    Clock,
    FileText,
    IndianRupee,
    Loader2,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { EmergencyEstimateDetail } from "@/types/emergencyRequest";

interface EstimateBreakdownCardProps {
    estimate: EmergencyEstimateDetail;
    history?: EmergencyEstimateDetail[];
    canCustomerRespond?: boolean;
    onApprove?: (estimateId: string) => Promise<void>;
    onReject?: (estimateId: string, reason?: string) => Promise<void>;
}

const STATUS_BADGE: Record<
    EmergencyEstimateDetail["status"],
    { label: string; badgeClass: string }
> = {
    draft: {
        label: "Draft",
        badgeClass: "border-border bg-muted text-muted-foreground",
    },
    submitted: {
        label: "Awaiting Customer Approval",
        badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    },
    approved: {
        label: "Approved · Ready for Payment",
        badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
    rejected: {
        label: "Rejected",
        badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
    },
    revised: {
        label: "Superseded Revision",
        badgeClass: "border-border bg-muted text-muted-foreground",
    },
    paid: {
        label: "Paid & Verified",
        badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
};

export function EstimateBreakdownCard({
    estimate,
    history = [],
    canCustomerRespond = false,
    onApprove,
    onReject,
}: EstimateBreakdownCardProps) {
    const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(
        null
    );
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const badge = STATUS_BADGE[estimate.status];
    const showActions =
        canCustomerRespond &&
        estimate.status === "submitted" &&
        estimate.id &&
        onApprove &&
        onReject;

    const handleApproveClick = async () => {
        if (!estimate.id || !onApprove || submitting) return;
        setSubmitting("approve");
        try {
            await onApprove(estimate.id);
        } finally {
            setSubmitting(null);
        }
    };

    const handleRejectClick = async () => {
        if (!estimate.id || !onReject || submitting) return;
        setSubmitting("reject");
        try {
            await onReject(estimate.id, rejectReason.trim() || undefined);
            setShowRejectBox(false);
            setRejectReason("");
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="size-4 text-primary" />
                        Service Estimate (Revision #{estimate.revision})
                    </CardTitle>

                    <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.badgeClass}`}
                    >
                        {badge.label}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
                {/* Itemized Lines */}
                <div className="overflow-hidden rounded-xl border border-border">
                    <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-3.5 py-2.5">
                        <div>
                            <p className="font-semibold text-foreground">
                                Vehicle Inspection Charge
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Included in combined repair bill
                            </p>
                        </div>
                        <span className="font-mono font-bold text-foreground">
                            ₹{estimate.inspectionCharge.toFixed(2)}
                        </span>
                    </div>

                    {estimate.items.map((item, idx) => (
                        <div
                            key={`${item.description}-${idx}`}
                            className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5 last:border-b-0"
                        >
                            <div className="min-w-0">
                                <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                                    {item.category}
                                </span>
                                <span className="font-medium text-foreground">
                                    {item.description}
                                </span>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    Qty {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                                </p>
                            </div>
                            <span className="shrink-0 font-mono font-semibold text-foreground">
                                ₹{item.totalPrice.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Summary Breakdown */}
                <div className="space-y-1.5 rounded-xl border border-border bg-secondary/30 p-3.5">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Inspection Charge</span>
                        <span>₹{estimate.inspectionCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Parts Total</span>
                        <span>₹{estimate.partsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Labour Total</span>
                        <span>₹{estimate.labourTotal.toFixed(2)}</span>
                    </div>
                    {estimate.additionalTotal > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                            <span>Additional Charges</span>
                            <span>₹{estimate.additionalTotal.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                        <span>Total Payable Amount</span>
                        <span className="flex items-center gap-0.5 text-primary">
                            <IndianRupee className="size-3.5" />
                            {estimate.totalAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                {estimate.estimatedCompletionMinutes && (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5 text-primary" />
                        Estimated repair duration:{" "}
                        <span className="font-semibold text-foreground">
                            ~{estimate.estimatedCompletionMinutes} minutes
                        </span>
                    </p>
                )}

                {estimate.notes && (
                    <p className="text-muted-foreground">
                        Mechanic Note:{" "}
                        <span className="text-foreground">{estimate.notes}</span>
                    </p>
                )}

                {estimate.status === "rejected" && estimate.rejectionReason && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                        Rejection reason: {estimate.rejectionReason}
                    </div>
                )}

                {showActions && (
                    <div className="space-y-3 border-t border-border pt-3">
                        {showRejectBox && (
                            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                                <Input
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    placeholder="Optional reason for rejecting this estimate..."
                                    className="h-9 bg-input text-xs"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowRejectBox(false)}
                                        disabled={submitting !== null}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        disabled={submitting !== null}
                                        onClick={() => void handleRejectClick()}
                                    >
                                        {submitting === "reject" ? (
                                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                        ) : null}
                                        Confirm Rejection
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                                disabled={submitting !== null}
                                onClick={() => setShowRejectBox(true)}
                            >
                                <XCircle className="size-4" />
                                Reject Estimate
                            </Button>

                            <Button
                                type="button"
                                className="flex-1 gap-1.5"
                                disabled={submitting !== null}
                                onClick={() => void handleApproveClick()}
                            >
                                {submitting === "approve" ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="size-4" />
                                )}
                                Approve Estimate (₹
                                {estimate.totalAmount.toFixed(2)})
                            </Button>
                        </div>
                    </div>
                )}

                {history.length > 1 && (
                    <div className="border-t border-border pt-3 text-[11px] text-muted-foreground">
                        Revision history: {history.length} revision(s) submitted
                        (latest #{estimate.revision}).
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

