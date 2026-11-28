import { CheckCircle2, Circle, Clock } from "lucide-react";
import type {
    EmergencyEstimateDetail,
    EmergencyInspectionDetail,
    EmergencyPaymentDetail,
    EmergencyRepairDetail,
    EmergencyRequestDetail,
} from "@/types/emergencyRequest";

interface TimelineStep {
    key: string;
    label: string;
    completed: boolean;
    active: boolean;
    timestamp?: string;
}

interface EmergencyProgressTimelineProps {
    request: EmergencyRequestDetail;
    inspection?: EmergencyInspectionDetail | null;
    latestEstimate?: EmergencyEstimateDetail | null;
    payment?: EmergencyPaymentDetail | null;
    repair?: EmergencyRepairDetail | null;
    distanceKm?: number | null;
}

function formatStepTime(iso?: string): string | undefined {
    if (!iso) return undefined;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return undefined;
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

export function EmergencyProgressTimeline({
    request,
    inspection,
    latestEstimate,
    payment,
    repair,
    distanceKm,
}: EmergencyProgressTimelineProps) {
    const isAssigned = Boolean(request.assignedMechanicId);
    const isOnTheWay =
        request.status === "on_the_way" ||
        request.status === "arrived" ||
        request.status === "completed";
    const isApproaching =
        isOnTheWay &&
        ((typeof distanceKm === "number" && distanceKm <= 1.2) ||
            request.status === "arrived" ||
            request.status === "completed");
    const isArrived =
        request.status === "arrived" || request.status === "completed";

    const inspectionStarted =
        inspection?.status === "in_progress" ||
        inspection?.status === "completed";
    const inspectionDone = inspection?.status === "completed";

    const estimateSubmitted = Boolean(latestEstimate);
    const estimateApproved =
        latestEstimate?.status === "approved" ||
        latestEstimate?.status === "paid";
    const paymentVerified =
        payment?.status === "paid" || latestEstimate?.status === "paid";

    const repairStarted =
        repair?.status === "in_progress" || repair?.status === "completed";
    const repairDone =
        repair?.status === "completed" || request.status === "completed";

    const rawSteps: Omit<TimelineStep, "active">[] = [
        {
            key: "created",
            label: "Request Created",
            completed: true,
            ...(request.createdAt
                ? { timestamp: formatStepTime(request.createdAt) }
                : {}),
        },
        {
            key: "assigned",
            label: "Mechanic Assigned",
            completed: isAssigned,
            ...(request.acceptedAt
                ? { timestamp: formatStepTime(request.acceptedAt) }
                : {}),
        },
        {
            key: "on_the_way",
            label: "Mechanic On The Way",
            completed: isOnTheWay,
            ...(request.travelStartedAt
                ? { timestamp: formatStepTime(request.travelStartedAt) }
                : {}),
        },
        {
            key: "approaching",
            label: "Mechanic Approaching",
            completed: isApproaching,
        },
        {
            key: "arrived",
            label: "Mechanic Arrived",
            completed: isArrived,
            ...(request.arrivedAt
                ? { timestamp: formatStepTime(request.arrivedAt) }
                : {}),
        },
        {
            key: "inspection_in_progress",
            label: "Inspection In Progress",
            completed: inspectionStarted,
            ...(inspection?.startedAt
                ? { timestamp: formatStepTime(inspection.startedAt) }
                : {}),
        },
        {
            key: "inspection_completed",
            label: "Inspection Completed",
            completed: inspectionDone,
            ...(inspection?.completedAt
                ? { timestamp: formatStepTime(inspection.completedAt) }
                : {}),
        },
        {
            key: "estimate_submitted",
            label: "Estimate Submitted",
            completed: estimateSubmitted,
            ...(latestEstimate?.submittedAt
                ? { timestamp: formatStepTime(latestEstimate.submittedAt) }
                : {}),
        },
        {
            key: "awaiting_approval",
            label:
                latestEstimate?.status === "rejected"
                    ? "Estimate Rejected (Awaiting Revision)"
                    : "Customer Approval",
            completed: estimateApproved,
            ...(latestEstimate?.approvedAt
                ? { timestamp: formatStepTime(latestEstimate.approvedAt) }
                : {}),
        },
        {
            key: "awaiting_payment",
            label: "Awaiting Combined Payment",
            completed: paymentVerified,
        },
        {
            key: "payment_verified",
            label: "Payment Verified",
            completed: paymentVerified,
            ...(payment?.paidAt
                ? { timestamp: formatStepTime(payment.paidAt) }
                : {}),
        },
        {
            key: "repair_in_progress",
            label: "Repair In Progress",
            completed: repairStarted,
            ...(repair?.startedAt
                ? { timestamp: formatStepTime(repair.startedAt) }
                : {}),
        },
        {
            key: "repair_completed",
            label: "Repair Completed",
            completed: repairDone,
            ...(repair?.completedAt || request.completedAt
                ? {
                      timestamp: formatStepTime(
                          repair?.completedAt ?? request.completedAt
                      ),
                  }
                : {}),
        },
    ];

    const firstIncompleteIdx = rawSteps.findIndex((s) => !s.completed);

    return (
        <div className="space-y-2.5">
            {rawSteps.map((step, index) => {
                const isActive =
                    request.status !== "cancelled" &&
                    index === firstIncompleteIdx;

                return (
                    <div
                        key={step.key}
                        className="flex items-start justify-between gap-3 text-xs"
                    >
                        <div className="flex items-center gap-2.5">
                            {step.completed ? (
                                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                            ) : isActive ? (
                                <Clock className="size-4 shrink-0 animate-pulse text-primary" />
                            ) : (
                                <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                            )}
                            <span
                                className={
                                    step.completed
                                        ? "font-semibold text-foreground"
                                        : isActive
                                          ? "font-semibold text-primary"
                                          : "text-muted-foreground"
                                }
                            >
                                {step.label}
                            </span>
                        </div>

                        {step.timestamp && (
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                                {step.timestamp}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

