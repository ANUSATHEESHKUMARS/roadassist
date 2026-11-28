import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    CreditCard,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { getApiErrorMessage } from "@/api/apiError";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { emergencyRequestService } from "@/services/EmergencyRequestService";
import type {
    EmergencyEstimateDetail,
    EmergencyPaymentDetail,
    VerifyEmergencyPaymentResponse,
} from "@/types/emergencyRequest";
import {
    getRazorpayConstructor,
    loadRazorpayScript,
    type RazorpayPaymentFailedResponse,
    type RazorpayPaymentSuccessResponse,
} from "@/utils/loadRazorpay";

interface EmergencyPaymentPanelProps {
    requestId: string;
    estimate: EmergencyEstimateDetail;
    payment: EmergencyPaymentDetail | null;
    customerPrefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    onPaymentVerified: (result: VerifyEmergencyPaymentResponse) => Promise<void> | void;
}

export function EmergencyPaymentPanel({
    requestId,
    estimate,
    payment,
    customerPrefill,
    onPaymentVerified,
}: EmergencyPaymentPanelProps) {
    const { showToast } = useToast();
    const [phase, setPhase] = useState<
        "idle" | "creating_order" | "checkout_open" | "verifying" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (payment?.status === "paid" || estimate.status === "paid") {
        return (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="space-y-3 p-5 text-xs">
                    <div className="flex items-center gap-2.5 text-emerald-400">
                        <CheckCircle2 className="size-5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold">
                                Combined Payment Verified
                            </p>
                            <p className="text-muted-foreground">
                                Mechanic can now begin the approved repair.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 rounded-lg border border-emerald-500/20 bg-card/60 p-3 sm:grid-cols-3">
                        <div>
                            <p className="text-[11px] text-muted-foreground">
                                Paid Amount
                            </p>
                            <p className="font-bold text-foreground">
                                ₹{(payment?.amount ?? estimate.totalAmount).toFixed(2)}
                            </p>
                        </div>
                        {payment?.razorpayPaymentId && (
                            <div>
                                <p className="text-[11px] text-muted-foreground">
                                    Transaction Reference
                                </p>
                                <p className="font-mono text-foreground">
                                    {payment.razorpayPaymentId}
                                </p>
                            </div>
                        )}
                        {payment?.paidAt && (
                            <div>
                                <p className="text-[11px] text-muted-foreground">
                                    Verified At
                                </p>
                                <p className="text-foreground">
                                    {new Date(payment.paidAt).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (estimate.status !== "approved") {
        return null;
    }

    const handlePayNow = async () => {
        if (phase === "creating_order" || phase === "verifying") return;
        setErrorMessage(null);

        try {
            setPhase("creating_order");
            const loaded = await loadRazorpayScript();
            const RazorpayCtor = getRazorpayConstructor();
            if (!loaded || !RazorpayCtor) {
                throw new Error(
                    "Unable to load Razorpay Checkout SDK. Check your internet connection."
                );
            }

            const order = await emergencyRequestService.createPaymentOrder(
                requestId
            );

            setPhase("checkout_open");

            const rzp = new RazorpayCtor({
                key: order.keyId,
                amount: order.amountPaise,
                currency: order.currency,
                name: "RoadAssist Enterprise",
                description: `Emergency Inspection & Repair (Rev #${order.estimateRevision})`,
                order_id: order.razorpayOrderId,
                prefill: customerPrefill,
                theme: { color: "#dc2626" },
                modal: {
                    ondismiss: () => {
                        setPhase("idle");
                    },
                },
                handler: async (res: RazorpayPaymentSuccessResponse) => {
                    try {
                        setPhase("verifying");
                        const verified =
                            await emergencyRequestService.verifyPayment(
                                requestId,
                                {
                                    razorpayOrderId: res.razorpay_order_id,
                                    razorpayPaymentId: res.razorpay_payment_id,
                                    razorpaySignature: res.razorpay_signature,
                                }
                            );
                        showToast(
                            "Payment verified! Your mechanic has been notified to start repair.",
                            "success"
                        );
                        setPhase("idle");
                        await onPaymentVerified(verified);
                    } catch (verifyErr) {
                        const msg = getApiErrorMessage(verifyErr);
                        setErrorMessage(msg);
                        setPhase("error");
                        showToast(msg, "error");
                    }
                },
            });

            rzp.on(
                "payment.failed",
                (failedRes: RazorpayPaymentFailedResponse) => {
                    const desc =
                        failedRes?.error?.description ||
                        "Payment failed at Razorpay checkout.";
                    setErrorMessage(desc);
                    setPhase("error");
                    showToast(desc, "error");
                }
            );

            rzp.open();
        } catch (err) {
            const msg = getApiErrorMessage(err);
            setErrorMessage(msg);
            setPhase("error");
            showToast(msg, "error");
        }
    };

    return (
        <Card className="border-primary/30 bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="size-4 text-primary" />
                    Pay Combined Estimate Before Repair
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
                <p className="text-muted-foreground">
                    Estimate Revision #{estimate.revision} is approved. Complete
                    the verified ₹{estimate.totalAmount.toFixed(2)} Razorpay
                    payment (inspection charge + approved repair items) before
                    your mechanic begins repair work.
                </p>

                {errorMessage && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <Button
                    type="button"
                    className="w-full gap-2"
                    disabled={
                        phase === "creating_order" || phase === "verifying"
                    }
                    onClick={() => void handlePayNow()}
                >
                    {phase === "creating_order" || phase === "verifying" ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <ShieldCheck className="size-4" />
                    )}
                    {phase === "creating_order"
                        ? "Creating Secure Order..."
                        : phase === "verifying"
                          ? "Verifying Payment..."
                          : `Pay ₹${estimate.totalAmount.toFixed(2)} Now`}
                </Button>
            </CardContent>
        </Card>
    );
}

