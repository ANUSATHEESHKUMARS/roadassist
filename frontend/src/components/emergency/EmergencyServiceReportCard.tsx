import { CheckCircle2, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmergencyServiceReport } from "@/types/emergencyRequest";

interface EmergencyServiceReportCardProps {
    report: EmergencyServiceReport;
}

export function EmergencyServiceReportCard({
    report,
}: EmergencyServiceReportCardProps) {
    return (
        <Card className="border-emerald-500/30 bg-card">
            <CardHeader className="border-b border-border pb-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="size-5 text-primary" />
                            Emergency Service Report &amp; Invoice
                        </CardTitle>
                        <p className="font-mono text-xs text-muted-foreground">
                            Reference: {report.reportReference} • Completed{" "}
                            {new Date(report.completedAt).toLocaleString()}
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        className="gap-1.5 self-start print:hidden"
                    >
                        <Printer className="size-3.5" />
                        Print / Save PDF Invoice
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 p-5 text-xs">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-secondary/30 p-3">
                        <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                            Customer
                        </p>
                        <p className="mt-1 font-bold text-foreground">
                            {report.customer.fullName}
                        </p>
                        <p className="text-muted-foreground">
                            {report.customer.phoneNumber}
                        </p>
                        <p className="text-muted-foreground">
                            {report.customer.email}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/30 p-3">
                        <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                            Vehicle
                        </p>
                        <p className="mt-1 font-bold text-foreground">
                            {report.vehicle.brand} {report.vehicle.model} (
                            {report.vehicle.year})
                        </p>
                        <p className="font-mono text-muted-foreground">
                            {report.vehicle.registrationNumber}
                        </p>
                        <p className="capitalize text-muted-foreground">
                            {report.vehicle.vehicleType} •{" "}
                            {report.vehicle.fuelType}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/30 p-3">
                        <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                            Mechanic Partner
                        </p>
                        <p className="mt-1 font-bold text-foreground">
                            {report.mechanic.fullName}
                        </p>
                        {report.mechanic.workshopName && (
                            <p className="text-muted-foreground">
                                {report.mechanic.workshopName}
                            </p>
                        )}
                        <p className="text-muted-foreground">
                            {report.mechanic.phoneNumber}
                        </p>
                    </div>
                </div>

                {/* Inspection Findings Summary */}
                <div className="space-y-2 rounded-xl border border-border p-4">
                    <p className="font-semibold text-foreground">
                        Inspection Summary &amp; Findings
                    </p>
                    <p className="text-muted-foreground">
                        Condition:{" "}
                        <span className="font-medium text-foreground">
                            {report.inspection.vehicleConditionSummary ?? "-"}
                        </span>
                    </p>
                    {report.inspection.findings.map((finding, idx) => (
                        <p key={idx} className="text-muted-foreground">
                            • <strong className="text-foreground">{finding.component}:</strong>{" "}
                            {finding.issue}
                        </p>
                    ))}
                </div>

                {/* Work Performed & Parts */}
                <div className="space-y-2 rounded-xl border border-border p-4">
                    <p className="font-semibold text-foreground">
                        Work Performed &amp; Parts Used
                    </p>
                    <p className="whitespace-pre-line text-foreground">
                        {report.repair.workPerformed ?? "-"}
                    </p>
                    {report.repair.partsUsed.length > 0 && (
                        <div className="pt-1">
                            <p className="text-[11px] text-muted-foreground">
                                Parts Used:
                            </p>
                            {report.repair.partsUsed.map((part, idx) => (
                                <p key={idx} className="text-muted-foreground">
                                    • {part.name} × {part.quantity}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Invoice Table */}
                <div className="space-y-2 rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">
                            Invoice Breakdown (Estimate Revision #
                            {report.approvedEstimate.revision})
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="size-3" />
                            Paid
                        </span>
                    </div>

                    <div className="space-y-1.5 border-t border-border pt-2">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Inspection Charge</span>
                            <span>
                                ₹
                                {report.approvedEstimate.inspectionCharge.toFixed(
                                    2
                                )}
                            </span>
                        </div>
                        {report.approvedEstimate.items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between text-muted-foreground"
                            >
                                <span>
                                    [{item.category.toUpperCase()}]{" "}
                                    {item.description} (×{item.quantity})
                                </span>
                                <span>₹{item.totalPrice.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                            <span>Total Paid</span>
                            <span className="text-emerald-400">
                                ₹{report.payment.amount.toFixed(2)}{" "}
                                {report.payment.currency}
                            </span>
                        </div>
                        {report.payment.razorpayPaymentId && (
                            <p className="pt-1 font-mono text-[11px] text-muted-foreground">
                                Razorpay Payment ID:{" "}
                                {report.payment.razorpayPaymentId}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default EmergencyServiceReportCard;

