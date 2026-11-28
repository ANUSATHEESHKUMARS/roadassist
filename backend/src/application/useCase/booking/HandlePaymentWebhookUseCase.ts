import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IEmergencyPaymentRepository } from "../../../domain/repositories/IEmergencyWorkflowRepositories.js";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { IPaymentGateway } from "../../contracts/IPaymentGateway.js";
import { WebhookProcessResultDto } from "../../dtos/booking/ScheduledBookingDtos.js";
import { IHandlePaymentWebhookUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { EmergencyPaymentSettlementHelper } from "../emergency/EmergencyPaymentUseCases.js";
import { PaymentSettlementHelper } from "./PaymentSettlementHelper.js";

interface RazorpayWebhookPayload {
    event?: string;
    payload?: {
        payment?: {
            entity?: {
                id?: string;
                order_id?: string;
                amount?: number;
                currency?: string;
                status?: string;
                error_description?: string;
            };
        };
        order?: {
            entity?: {
                id?: string;
            };
        };
        refund?: {
            entity?: {
                id?: string;
                payment_id?: string;
                status?: string;
            };
        };
    };
}

export class HandlePaymentWebhookUseCase
    implements IHandlePaymentWebhookUseCase
{
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly paymentRepository: IPaymentRepository,
        private readonly paymentGateway: IPaymentGateway,
        private readonly settlementHelper: PaymentSettlementHelper,
        private readonly emergencyPaymentRepository?: IEmergencyPaymentRepository,
        private readonly emergencySettlementHelper?: EmergencyPaymentSettlementHelper
    ) {}

    async execute(
        rawBody: Buffer | string,
        signature: string,
        payload: unknown
    ): Promise<WebhookProcessResultDto> {
        const isValid = this.paymentGateway.verifyWebhookSignature(
            rawBody,
            signature
        );
        if (!isValid) {
            throw new BadRequest(
                "Invalid Razorpay webhook signature",
                "INVALID_WEBHOOK_SIGNATURE"
            );
        }

        const body = (payload ?? {}) as RazorpayWebhookPayload;
        const event = body.event ?? "unknown";
        const paymentEntity = body.payload?.payment?.entity;
        const orderEntity = body.payload?.order?.entity;
        const refundEntity = body.payload?.refund?.entity;

        if (event === "refund.processed" || event === "refund.failed") {
            const refundPaymentId = refundEntity?.payment_id;
            if (!refundPaymentId) {
                return {
                    received: true,
                    event,
                    processed: false,
                    message: "Missing payment_id in refund webhook",
                };
            }

            const refundPayment =
                await this.paymentRepository.findByRazorpayPaymentId(refundPaymentId);
            if (!refundPayment) {
                return {
                    received: true,
                    event,
                    processed: false,
                    message: "Payment record not found for refund",
                };
            }

            if (event === "refund.processed") {
                if (refundPayment.status === "refunded") {
                    return {
                        received: true,
                        event,
                        processed: true,
                        message: "Refund already marked processed idempotently",
                    };
                }
                await this.paymentRepository.updateStatus(
                    refundPayment.id!,
                    "refunded",
                    {
                        ...(refundEntity?.id !== undefined
                            ? { refundId: refundEntity.id }
                            : {}),
                        refundedAt: new Date(),
                    },
                    ["refund_requested", "refund_pending"]
                );
                return {
                    received: true,
                    event,
                    processed: true,
                    message: "Refund marked as completed",
                };
            }

            await this.paymentRepository.updateStatus(
                refundPayment.id!,
                "refund_pending",
                {
                    failureReason: "Razorpay refund failed; manual/retry required",
                },
                ["refund_requested"]
            );
            return {
                received: true,
                event,
                processed: true,
                message: "Refund failure recorded as refund_pending",
            };
        }

        const razorpayOrderId = paymentEntity?.order_id ?? orderEntity?.id;
        const razorpayPaymentId = paymentEntity?.id;

        if (!razorpayOrderId) {
            return {
                received: true,
                event,
                processed: false,
                message: "No order ID found in webhook payload",
            };
        }

        const payment =
            await this.paymentRepository.findByRazorpayOrderId(razorpayOrderId);
        if (!payment) {
            if (
                this.emergencyPaymentRepository &&
                this.emergencySettlementHelper
            ) {
                const emergencyPayment =
                    await this.emergencyPaymentRepository.findByRazorpayOrderId(
                        razorpayOrderId
                    );
                if (emergencyPayment) {
                    if (event === "payment.failed") {
                        if (emergencyPayment.status !== "paid") {
                            await this.emergencyPaymentRepository.updateStatusWithGuard(
                                emergencyPayment.id!,
                                ["pending", "processing"],
                                "failed",
                                {
                                    ...(razorpayPaymentId !== undefined
                                        ? { razorpayPaymentId }
                                        : {}),
                                    failureReason:
                                        paymentEntity?.error_description ??
                                        "Emergency payment failed at Razorpay",
                                }
                            );
                        }
                        return {
                            received: true,
                            event,
                            processed: true,
                            message: "Emergency payment failure recorded",
                        };
                    }

                    if (event === "payment.captured" || event === "order.paid") {
                        if (!razorpayPaymentId) {
                            return {
                                received: true,
                                event,
                                processed: false,
                                message:
                                    "Missing payment ID in emergency capture webhook",
                            };
                        }
                        if (
                            paymentEntity?.amount !== undefined &&
                            paymentEntity.amount !== emergencyPayment.amountPaise
                        ) {
                            throw new BadRequest(
                                "Webhook emergency payment amount mismatch",
                                "WEBHOOK_AMOUNT_MISMATCH"
                            );
                        }
                        if (
                            paymentEntity?.currency &&
                            paymentEntity.currency.toUpperCase() !==
                                emergencyPayment.currency.toUpperCase()
                        ) {
                            throw new BadRequest(
                                "Webhook emergency payment currency mismatch",
                                "WEBHOOK_CURRENCY_MISMATCH"
                            );
                        }
                        await this.emergencySettlementHelper.settlePaidPayment({
                            payment: emergencyPayment,
                            razorpayPaymentId,
                        });
                        return {
                            received: true,
                            event,
                            processed: true,
                            message: "Emergency payment captured and settled",
                        };
                    }
                }
            }

            return {
                received: true,
                event,
                processed: false,
                message: "Payment record not found for order",
            };
        }

        if (event === "payment.failed") {
            if (
                payment.status !== "paid" &&
                payment.status !== "refunded" &&
                payment.status !== "refund_requested" &&
                payment.status !== "refund_pending"
            ) {
                await this.paymentRepository.updateStatus(
                    payment.id!,
                    "failed",
                    {
                        ...(razorpayPaymentId !== undefined
                            ? { razorpayPaymentId }
                            : {}),
                        failureReason:
                            paymentEntity?.error_description ??
                            "Payment failed at Razorpay",
                    },
                    ["created", "pending"]
                );
            }

            return {
                received: true,
                event,
                processed: true,
                message: "Payment failure recorded",
            };
        }

        if (event === "payment.captured" || event === "order.paid") {
            if (!razorpayPaymentId) {
                return {
                    received: true,
                    event,
                    processed: false,
                    message: "Missing payment ID in capture webhook",
                };
            }

            if (
                paymentEntity?.amount !== undefined &&
                paymentEntity.amount !== payment.amountPaise
            ) {
                await this.paymentRepository.updateStatus(
                    payment.id!,
                    "failed",
                    {
                        razorpayPaymentId,
                        failureReason: "Webhook payment amount mismatch",
                    },
                    ["created", "pending"]
                );
                return {
                    received: true,
                    event,
                    processed: true,
                    message: "Amount mismatch recorded as failed",
                };
            }

            const booking = await this.bookingRepository.findById(
                payment.bookingId
            );
            if (!booking) {
                return {
                    received: true,
                    event,
                    processed: false,
                    message: "Booking record not found",
                };
            }

            if (payment.status === "paid" && booking.status === "confirmed") {
                const existingAllocation =
                    await this.paymentRepository.findAllocationByBookingId(
                        booking.id!
                    );
                if (existingAllocation) {
                    return {
                        received: true,
                        event,
                        processed: true,
                        message: "Payment already processed idempotently",
                    };
                }
            }

            await this.settlementHelper.settleOrRefund({
                booking,
                payment,
                razorpayPaymentId,
            });

            return {
                received: true,
                event,
                processed: true,
                message: "Payment captured and booking settled",
            };
        }

        return {
            received: true,
            event,
            processed: false,
            message: `Event ${event} acknowledged without action`,
        };
    }
}

