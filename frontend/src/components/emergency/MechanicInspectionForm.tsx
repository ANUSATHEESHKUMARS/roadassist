import { useState } from "react";
import {
    CheckCircle2,
    ClipboardCheck,
    Loader2,
    Plus,
    Trash2,
} from "lucide-react";
import { getApiErrorMessage } from "@/api/apiError";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { InspectionDetailsCard } from "@/components/emergency/InspectionDetailsCard";
import { mechanicEmergencyService } from "@/services/mechanic/mechanicEmergencyService";
import type {
    EmergencyInspectionDetail,
    FindingSeverity,
} from "@/types/emergencyRequest";

interface MechanicInspectionFormProps {
    requestId: string;
    inspection: EmergencyInspectionDetail | null;
    onUpdated: () => Promise<void> | void;
}

interface DraftFinding {
    component: string;
    issue: string;
    severity: FindingSeverity;
    recommendedAction: string;
}

export function MechanicInspectionForm({
    requestId,
    inspection,
    onUpdated,
}: MechanicInspectionFormProps) {
    const { showToast } = useToast();
    const [busy, setBusy] = useState(false);
    const [vehicleConditionSummary, setVehicleConditionSummary] = useState("");
    const [findings, setFindings] = useState<DraftFinding[]>([
        {
            component: "",
            issue: "",
            severity: "medium",
            recommendedAction: "",
        },
    ]);
    const [requiredRepairsText, setRequiredRepairsText] = useState("");
    const [notes, setNotes] = useState("");

    if (inspection?.status === "completed") {
        return <InspectionDetailsCard inspection={inspection} />;
    }

    const handleStartInspection = async () => {
        if (busy) return;
        setBusy(true);
        try {
            await mechanicEmergencyService.startInspection(requestId);
            showToast("Vehicle inspection started.", "success");
            await onUpdated();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setBusy(false);
        }
    };

    const handleFindingChange = <K extends keyof DraftFinding>(
        index: number,
        field: K,
        value: DraftFinding[K]
    ) => {
        setFindings((prev) =>
            prev.map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item
            )
        );
    };

    const handleAddFinding = () => {
        setFindings((prev) => [
            ...prev,
            {
                component: "",
                issue: "",
                severity: "medium",
                recommendedAction: "",
            },
        ]);
    };

    const handleRemoveFinding = (index: number) => {
        setFindings((prev) =>
            prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev
        );
    };

    const handleCompleteInspection = async () => {
        if (busy) return;

        const cleanedFindings = findings
            .filter(
                (f) => f.component.trim().length >= 2 && f.issue.trim().length >= 2
            )
            .map((f) => ({
                component: f.component.trim(),
                issue: f.issue.trim(),
                severity: f.severity,
                ...(f.recommendedAction.trim()
                    ? { recommendedAction: f.recommendedAction.trim() }
                    : {}),
            }));

        const requiredRepairs = requiredRepairsText
            .split(/\n|,/)
            .map((entry) => entry.trim())
            .filter((entry) => entry.length >= 2);

        if (vehicleConditionSummary.trim().length < 5) {
            showToast(
                "Please enter a vehicle condition summary (at least 5 characters).",
                "error"
            );
            return;
        }
        if (cleanedFindings.length === 0) {
            showToast(
                "Please record at least one inspection finding.",
                "error"
            );
            return;
        }
        if (requiredRepairs.length === 0) {
            showToast(
                "Please list at least one required repair action.",
                "error"
            );
            return;
        }

        setBusy(true);
        try {
            await mechanicEmergencyService.completeInspection(requestId, {
                vehicleConditionSummary: vehicleConditionSummary.trim(),
                findings: cleanedFindings,
                requiredRepairs,
                ...(notes.trim() ? { notes: notes.trim() } : {}),
            });
            showToast(
                "Inspection completed. You can now submit the repair estimate.",
                "success"
            );
            await onUpdated();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setBusy(false);
        }
    };

    if (!inspection || inspection.status === "pending") {
        return (
            <Card className="border-primary/20 bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ClipboardCheck className="size-4 text-primary" />
                        Step 1: On-Site Vehicle Inspection
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                    <p className="text-muted-foreground">
                        Start the on-site vehicle inspection to record diagnostic
                        findings and prepare a combined estimate for the customer.
                    </p>
                    <Button
                        type="button"
                        onClick={handleStartInspection}
                        disabled={busy}
                        className="w-full gap-2"
                    >
                        {busy ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <ClipboardCheck className="size-4" />
                        )}
                        Start Vehicle Inspection
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardCheck className="size-4 text-primary" />
                    Record Inspection Findings
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
                <div className="space-y-1.5">
                    <Label htmlFor="inspection-condition-summary">
                        Vehicle Condition Summary
                    </Label>
                    <Input
                        id="inspection-condition-summary"
                        placeholder="e.g., Alternator voltage low and battery terminal corroded"
                        value={vehicleConditionSummary}
                        onChange={(e) =>
                            setVehicleConditionSummary(e.target.value)
                        }
                    />
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <Label>Diagnostic Findings</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddFinding}
                            className="h-7 gap-1 text-xs"
                        >
                            <Plus className="size-3" />
                            Add Finding
                        </Button>
                    </div>

                    {findings.map((finding, index) => (
                        <div
                            key={index}
                            className="space-y-2 rounded-lg border border-border bg-muted/30 p-3"
                        >
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                <Input
                                    placeholder="Component (e.g., Battery)"
                                    value={finding.component}
                                    onChange={(e) =>
                                        handleFindingChange(
                                            index,
                                            "component",
                                            e.target.value
                                        )
                                    }
                                    className="sm:col-span-2"
                                />
                                <select
                                    value={finding.severity}
                                    onChange={(e) =>
                                        handleFindingChange(
                                            index,
                                            "severity",
                                            e.target.value as FindingSeverity
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
                                >
                                    <option value="low">Low severity</option>
                                    <option value="medium">
                                        Medium severity
                                    </option>
                                    <option value="high">High severity</option>
                                </select>
                            </div>

                            <Input
                                placeholder="Observed issue details"
                                value={finding.issue}
                                onChange={(e) =>
                                    handleFindingChange(
                                        index,
                                        "issue",
                                        e.target.value
                                    )
                                }
                            />

                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Recommended action (optional)"
                                    value={finding.recommendedAction}
                                    onChange={(e) =>
                                        handleFindingChange(
                                            index,
                                            "recommendedAction",
                                            e.target.value
                                        )
                                    }
                                />
                                {findings.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleRemoveFinding(index)
                                        }
                                        className="shrink-0 text-destructive"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="inspection-required-repairs">
                        Required Repairs (comma or newline separated)
                    </Label>
                    <textarea
                        id="inspection-required-repairs"
                        rows={2}
                        placeholder="Replace corroded battery clamp, Recharge / replace 12V battery"
                        value={requiredRepairsText}
                        onChange={(e) =>
                            setRequiredRepairsText(e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="inspection-notes">
                        Additional Mechanic Notes (optional)
                    </Label>
                    <Input
                        id="inspection-notes"
                        placeholder="Any safety or vehicle observation"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <Button
                    type="button"
                    onClick={handleCompleteInspection}
                    disabled={busy}
                    className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="size-4" />
                    )}
                    Complete Inspection
                </Button>
            </CardContent>
        </Card>
    );
}
