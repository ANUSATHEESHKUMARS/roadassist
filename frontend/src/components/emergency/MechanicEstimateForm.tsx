import { useEffect, useState } from "react";
import {
    AlertTriangle,
    FileText,
    IndianRupee,
    Loader2,
    Plus,
    Send,
    Trash2,
} from "lucide-react";
import { getApiErrorMessage } from "@/api/apiError";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { mechanicEmergencyService } from "@/services/mechanic/mechanicEmergencyService";
import type {
    EmergencyEstimateDetail,
    EmergencyEstimateItem,
    EstimateItemCategory,
} from "@/types/emergencyRequest";

interface MechanicEstimateFormProps {
    requestId: string;
    latestEstimate: EmergencyEstimateDetail | null;
    onUpdated: () => Promise<void> | void;
}

export function MechanicEstimateForm({
    requestId,
    latestEstimate,
    onUpdated,
}: MechanicEstimateFormProps) {
    const { showToast } = useToast();
    const [busy, setBusy] = useState(false);
    const [inspectionCharge, setInspectionCharge] = useState("250");
    const [items, setItems] = useState<EmergencyEstimateItem[]>([
        {
            description: "",
            category: "labour",
            quantity: 1,
            unitPrice: 0,
        },
    ]);
    const [estimatedMinutes, setEstimatedMinutes] = useState("45");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (latestEstimate?.status === "rejected") {
            setInspectionCharge(String(latestEstimate.inspectionCharge));
            if (latestEstimate.items.length > 0) {
                setItems(
                    latestEstimate.items.map((item) => ({
                        description: item.description,
                        category: item.category,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    }))
                );
            }
            if (latestEstimate.estimatedCompletionMinutes) {
                setEstimatedMinutes(
                    String(latestEstimate.estimatedCompletionMinutes)
                );
            }
        }
    }, [latestEstimate?.id, latestEstimate?.status]);

    const canSubmitForm =
        !latestEstimate || latestEstimate.status === "rejected";

    if (!canSubmitForm) {
        return null;
    }

    const parsedInspectionCharge = Math.max(0, Number(inspectionCharge) || 0);
    const previewPartsTotal = items
        .filter((item) => item.category === "part")
        .reduce(
            (sum, item) =>
                sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice),
            0
        );
    const previewLabourTotal = items
        .filter((item) => item.category === "labour")
        .reduce(
            (sum, item) =>
                sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice),
            0
        );
    const previewAdditionalTotal = items
        .filter((item) => item.category === "additional")
        .reduce(
            (sum, item) =>
                sum + Math.max(0, item.quantity) * Math.max(0, item.unitPrice),
            0
        );
    const previewTotal =
        parsedInspectionCharge +
        previewPartsTotal +
        previewLabourTotal +
        previewAdditionalTotal;

    const handleItemChange = <K extends keyof EmergencyEstimateItem>(
        index: number,
        field: K,
        value: EmergencyEstimateItem[K]
    ) => {
        setItems((prev) =>
            prev.map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item
            )
        );
    };

    const handleAddItem = () => {
        setItems((prev) => [
            ...prev,
            {
                description: "",
                category: "part",
                quantity: 1,
                unitPrice: 0,
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems((prev) =>
            prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev
        );
    };

    const handleSubmit = async () => {
        if (busy) return;

        const cleanedItems: EmergencyEstimateItem[] = items
            .filter(
                (item) =>
                    item.description.trim().length >= 2 && item.quantity >= 1
            )
            .map((item) => ({
                description: item.description.trim(),
                category: item.category,
                quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
                unitPrice: Math.max(0, Number(item.unitPrice) || 0),
            }));

        if (cleanedItems.length === 0) {
            showToast(
                "Add at least one valid estimate line item.",
                "error"
            );
            return;
        }

        if (
            parsedInspectionCharge +
                cleanedItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0) <=
            0
        ) {
            showToast("Total estimate amount must be greater than ₹0.", "error");
            return;
        }

        const parsedMinutes = Number(estimatedMinutes);

        setBusy(true);
        try {
            await mechanicEmergencyService.submitEstimate(requestId, {
                inspectionCharge: parsedInspectionCharge,
                items: cleanedItems,
                ...(Number.isFinite(parsedMinutes) && parsedMinutes >= 1
                    ? { estimatedCompletionMinutes: Math.round(parsedMinutes) }
                    : {}),
                ...(notes.trim() ? { notes: notes.trim() } : {}),
            });
            showToast(
                latestEstimate?.status === "rejected"
                    ? "Revised estimate submitted to customer."
                    : "Estimate submitted to customer for approval.",
                "success"
            );
            await onUpdated();
        } catch (err) {
            showToast(getApiErrorMessage(err), "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-4 text-primary" />
                    {latestEstimate?.status === "rejected"
                        ? `Submit Revised Estimate (Revision #${latestEstimate.revision + 1})`
                        : "Step 2: Create Combined Inspection & Repair Estimate"}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
                {latestEstimate?.status === "rejected" && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <div>
                            <p className="font-semibold">
                                Previous estimate rejected by customer
                            </p>
                            {latestEstimate.rejectionReason && (
                                <p className="mt-0.5">
                                    Reason: {latestEstimate.rejectionReason}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="estimate-inspection-charge">
                            Inspection Charge (₹)
                        </Label>
                        <Input
                            id="estimate-inspection-charge"
                            type="number"
                            min={0}
                            value={inspectionCharge}
                            onChange={(e) => setInspectionCharge(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="estimate-minutes">
                            Estimated Repair Time (minutes)
                        </Label>
                        <Input
                            id="estimate-minutes"
                            type="number"
                            min={5}
                            value={estimatedMinutes}
                            onChange={(e) => setEstimatedMinutes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <Label>Line Items (Parts, Labour &amp; Additional)</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddItem}
                            className="h-7 gap-1 text-xs"
                        >
                            <Plus className="size-3" />
                            Add Item
                        </Button>
                    </div>

                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-12"
                        >
                            <Input
                                placeholder="Item description"
                                value={item.description}
                                onChange={(e) =>
                                    handleItemChange(
                                        index,
                                        "description",
                                        e.target.value
                                    )
                                }
                                className="sm:col-span-5"
                            />
                            <select
                                value={item.category}
                                onChange={(e) =>
                                    handleItemChange(
                                        index,
                                        "category",
                                        e.target.value as EstimateItemCategory
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground sm:col-span-3"
                            >
                                <option value="labour">Labour</option>
                                <option value="part">Spare Part</option>
                                <option value="additional">Additional</option>
                            </select>
                            <Input
                                type="number"
                                min={1}
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) =>
                                    handleItemChange(
                                        index,
                                        "quantity",
                                        Number(e.target.value)
                                    )
                                }
                                className="sm:col-span-1"
                            />
                            <Input
                                type="number"
                                min={0}
                                placeholder="₹ Price"
                                value={item.unitPrice}
                                onChange={(e) =>
                                    handleItemChange(
                                        index,
                                        "unitPrice",
                                        Number(e.target.value)
                                    )
                                }
                                className="sm:col-span-2"
                            />
                            <div className="flex items-center justify-end sm:col-span-1">
                                {items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="estimate-notes">Notes for Customer</Label>
                    <Input
                        id="estimate-notes"
                        placeholder="Optional warranty, spare part grade, or timing notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                    <span className="font-medium text-muted-foreground">
                        Calculated Combined Estimate Preview
                    </span>
                    <span className="flex items-center gap-0.5 text-sm font-bold text-foreground">
                        <IndianRupee className="size-3.5" />
                        {previewTotal.toFixed(2)}
                    </span>
                </div>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={busy}
                    className="w-full gap-2"
                >
                    {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                    {latestEstimate?.status === "rejected"
                        ? "Send Revised Estimate to Customer"
                        : "Submit Estimate to Customer"}
                </Button>
            </CardContent>
        </Card>
    );
}
