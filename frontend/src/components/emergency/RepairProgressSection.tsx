import { useState } from "react";
import {
    CheckCircle2,
    Clock,
    Loader2,
    Play,
    Plus,
    Trash2,
    Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
    EmergencyRepairDetail,
    RepairPartUsed,
} from "@/types/emergencyRequest";

interface RepairProgressSectionProps {
    repair: EmergencyRepairDetail | null;
    isMechanic?: boolean;
    canStartRepair?: boolean;
    onStartRepair?: () => Promise<void>;
    onLogProgress?: (note: string) => Promise<void>;
    onCompleteRepair?: (payload: {
        workPerformed: string;
        partsUsed: RepairPartUsed[];
    }) => Promise<void>;
}

export function RepairProgressSection({
    repair,
    isMechanic = false,
    canStartRepair = false,
    onStartRepair,
    onLogProgress,
    onCompleteRepair,
}: RepairProgressSectionProps) {
    const [progressNote, setProgressNote] = useState("");
    const [workPerformed, setWorkPerformed] = useState("");
    const [partsUsed, setPartsUsed] = useState<RepairPartUsed[]>([]);
    const [busyAction, setBusyAction] = useState<
        "start" | "progress" | "complete" | null
    >(null);

    if (!repair && !(isMechanic && canStartRepair)) {
        return null;
    }

    const handleStart = async () => {
        if (!onStartRepair || busyAction) return;
        setBusyAction("start");
        try {
            await onStartRepair();
        } finally {
            setBusyAction(null);
        }
    };

    const handleAddNote = async () => {
        if (!onLogProgress || busyAction || progressNote.trim().length < 2) {
            return;
        }
        setBusyAction("progress");
        try {
            await onLogProgress(progressNote.trim());
            setProgressNote("");
        } finally {
            setBusyAction(null);
        }
    };

    const handleComplete = async () => {
        if (!onCompleteRepair || busyAction || workPerformed.trim().length < 5) {
            return;
        }
        const cleanedParts = partsUsed.filter(
            (p) => p.name.trim().length >= 2 && p.quantity >= 1
        );
        setBusyAction("complete");
        try {
            await onCompleteRepair({
                workPerformed: workPerformed.trim(),
                partsUsed: cleanedParts.map((p) => ({
                    name: p.name.trim(),
                    quantity: Math.max(1, Math.round(p.quantity)),
                    ...(p.notes?.trim() ? { notes: p.notes.trim() } : {}),
                })),
            });
        } finally {
            setBusyAction(null);
        }
    };

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Wrench className="size-4 text-primary" />
                        Repair Progress
                    </CardTitle>

                    {repair && (
                        <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                                repair.status === "completed"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                    : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                            }`}
                        >
                            {repair.status === "completed" ? (
                                <CheckCircle2 className="size-3" />
                            ) : (
                                <Clock className="size-3" />
                            )}
                            {repair.status.replace("_", " ")}
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
                {/* Mechanic Start Repair CTA */}
                {isMechanic && (!repair || repair.status === "pending") && (
                    <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                        <p className="text-foreground">
                            Customer payment has been verified. You can start
                            the emergency repair now.
                        </p>
                        <Button
                            type="button"
                            className="w-full gap-2"
                            disabled={!canStartRepair || busyAction !== null}
                            onClick={() => void handleStart()}
                        >
                            {busyAction === "start" ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Play className="size-4" />
                            )}
                            Start Repair
                        </Button>
                    </div>
                )}

                {/* Progress Logs */}
                {repair && repair.progressLogs.length > 0 && (
                    <div className="space-y-2">
                        <p className="font-semibold text-foreground">
                            Live Repair Updates
                        </p>
                        <div className="space-y-1.5 rounded-xl border border-border bg-secondary/30 p-3">
                            {repair.progressLogs.map((entry, idx) => (
                                <div
                                    key={`${entry.loggedAt}-${idx}`}
                                    className="flex items-start justify-between gap-3"
                                >
                                    <span className="text-foreground">
                                        • {entry.note}
                                    </span>
                                    <span className="shrink-0 text-[11px] text-muted-foreground">
                                        {new Date(
                                            entry.loggedAt
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Repair Mechanic Controls */}
                {isMechanic && repair?.status === "in_progress" && (
                    <div className="space-y-5 border-t border-border pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">
                                Log Progress Update (Optional)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={progressNote}
                                    onChange={(e) =>
                                        setProgressNote(e.target.value)
                                    }
                                    placeholder="e.g. Replaced alternator belt and testing battery output"
                                    className="h-9 bg-input text-xs"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        busyAction !== null ||
                                        progressNote.trim().length < 2
                                    }
                                    onClick={() => void handleAddNote()}
                                >
                                    {busyAction === "progress" ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        "Add Update"
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                            <p className="text-sm font-semibold text-foreground">
                                Complete Repair &amp; Generate Service Report
                            </p>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="workPerformed"
                                    className="text-xs"
                                >
                                    Work Performed *
                                </Label>
                                <textarea
                                    id="workPerformed"
                                    rows={3}
                                    value={workPerformed}
                                    onChange={(e) =>
                                        setWorkPerformed(e.target.value)
                                    }
                                    placeholder="Describe the repair work completed and final safety check..."
                                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">
                                        Parts Used
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setPartsUsed((prev) => [
                                                ...prev,
                                                { name: "", quantity: 1 },
                                            ])
                                        }
                                        className="h-7 gap-1 px-2 text-xs"
                                    >
                                        <Plus className="size-3" />
                                        Add Part
                                    </Button>
                                </div>

                                {partsUsed.map((part, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-12 items-center gap-2"
                                    >
                                        <Input
                                            value={part.name}
                                            onChange={(e) =>
                                                setPartsUsed((prev) =>
                                                    prev.map((p, i) =>
                                                        i === index
                                                            ? {
                                                                  ...p,
                                                                  name: e.target
                                                                      .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                            placeholder="Part name"
                                            className="col-span-7 h-8 bg-input text-xs"
                                        />
                                        <Input
                                            type="number"
                                            min={1}
                                            value={part.quantity}
                                            onChange={(e) =>
                                                setPartsUsed((prev) =>
                                                    prev.map((p, i) =>
                                                        i === index
                                                            ? {
                                                                  ...p,
                                                                  quantity:
                                                                      Number(
                                                                          e
                                                                              .target
                                                                              .value
                                                                      ) || 1,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                            className="col-span-3 h-8 bg-input text-xs"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setPartsUsed((prev) =>
                                                    prev.filter(
                                                        (_, i) => i !== index
                                                    )
                                                )
                                            }
                                            className="col-span-2 h-8 text-destructive"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                                disabled={
                                    busyAction !== null ||
                                    workPerformed.trim().length < 5
                                }
                                onClick={() => void handleComplete()}
                            >
                                {busyAction === "complete" ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="size-4" />
                                )}
                                Mark Repair Completed
                            </Button>
                        </div>
                    </div>
                )}

                {/* Completed Summary */}
                {repair?.status === "completed" && (
                    <div className="space-y-3 border-t border-border pt-3">
                        {repair.workPerformed && (
                            <div>
                                <p className="text-[11px] text-muted-foreground">
                                    Work Performed
                                </p>
                                <p className="mt-0.5 whitespace-pre-line font-medium text-foreground">
                                    {repair.workPerformed}
                                </p>
                            </div>
                        )}
                        {repair.partsUsed.length > 0 && (
                            <div>
                                <p className="text-[11px] text-muted-foreground">
                                    Parts Replaced / Used
                                </p>
                                <ul className="mt-1 space-y-1">
                                    {repair.partsUsed.map((part, idx) => (
                                        <li key={idx} className="text-foreground">
                                            • {part.name} (Qty: {part.quantity})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

