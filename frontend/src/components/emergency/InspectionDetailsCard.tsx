import { AlertTriangle, CheckCircle2, ClipboardCheck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmergencyInspectionDetail } from "@/types/emergencyRequest";

interface InspectionDetailsCardProps {
    inspection: EmergencyInspectionDetail;
}

const SEVERITY_BADGE = {
    low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    high: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function InspectionDetailsCard({
    inspection,
}: InspectionDetailsCardProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ClipboardCheck className="size-4 text-primary" />
                        Vehicle Inspection
                    </CardTitle>

                    <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                            inspection.status === "completed"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                        }`}
                    >
                        {inspection.status === "completed" ? (
                            <CheckCircle2 className="size-3" />
                        ) : (
                            <Clock className="size-3" />
                        )}
                        {inspection.status.replace("_", " ")}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
                {inspection.status === "in_progress" && (
                    <p className="text-muted-foreground">
                        Mechanic is inspecting your vehicle on-site and recording findings.
                    </p>
                )}

                {inspection.vehicleConditionSummary && (
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                        <p className="text-[11px] text-muted-foreground">
                            Vehicle Condition Summary
                        </p>
                        <p className="mt-1 font-semibold text-foreground">
                            {inspection.vehicleConditionSummary}
                        </p>
                    </div>
                )}

                {inspection.findings.length > 0 && (
                    <div className="space-y-2">
                        <p className="font-semibold text-foreground">
                            Inspection Findings
                        </p>
                        <div className="space-y-2">
                            {inspection.findings.map((finding, index) => (
                                <div
                                    key={`${finding.component}-${index}`}
                                    className="rounded-lg border border-border bg-muted/30 p-3 space-y-1"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-foreground">
                                            {finding.component}
                                        </span>
                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                SEVERITY_BADGE[finding.severity]
                                            }`}
                                        >
                                            {finding.severity}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {finding.issue}
                                    </p>
                                    {finding.recommendedAction && (
                                        <p className="text-[11px] text-primary">
                                            Recommended: {finding.recommendedAction}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {inspection.requiredRepairs.length > 0 && (
                    <div className="space-y-1.5">
                        <p className="font-semibold text-foreground">
                            Required Repairs
                        </p>
                        <ul className="space-y-1">
                            {inspection.requiredRepairs.map((repair, idx) => (
                                <li
                                    key={`${repair}-${idx}`}
                                    className="flex items-center gap-2 text-muted-foreground"
                                >
                                    <AlertTriangle className="size-3 shrink-0 text-amber-400" />
                                    <span className="text-foreground">{repair}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {inspection.notes && (
                    <div className="border-t border-border pt-2.5 text-muted-foreground">
                        Notes: <span className="text-foreground">{inspection.notes}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

