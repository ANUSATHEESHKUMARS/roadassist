import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import { Booking } from "../../../domain/User/entities/Booking.js";
import { Payment } from "../../../domain/User/entities/Payment.js";
import { PaymentAllocation } from "../../../domain/User/entities/PaymentAllocation.js";
import { ITransactionManager } from "../../../infrastructure/databases/interface/IMongoTransactionManger.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { IPaymentGateway } from "../../contracts/IPaymentGateway.js";
import { getPaymentAllocationBreakdown } from "../../constants/bookingConfig.js";
import { VerifyPaymentResponseDto } from "../../dtos/booking/ScheduledBookingDtos.js";

export interface SettlePaidPaymentInput {
    booking: Booking;
    payment: Payment;
    razorpayPaymentId: string;
    razorpaySignature?: string;
}

export class PaymentSettlementHelper {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly paymentRepository: IPaymentRepository,
        private readonly paymentGateway: IPaymentGateway,
        private readonly transactionManager: ITransactionManager
    ) {}

    async settleOrRefund(
        input: SettlePaidPaymentInput
    ): Promise<VerifyPaymentResponseDto> {
        const { booking, payment, razorpayPaymentId, razorpaySignature } = input;
        const now = new Date();

        // Idempotency: already paid and confirmed
        if (payment.status === "paid" && booking.status === "confirmed") {
            const existingAllocation =
                await this.paymentRepository.findAllocationByBookingId(booking.id!);
            if (existingAllocation) {
                return this.buildResponse(booking, payment, existingAllocation);
            }
        }

        const isReservationExpired =
            booking.status === "expired" ||
            (booking.status === "pending_payment" &&
                booking.reservationExpiresAt !== undefined &&
                booking.reservationExpiresAt <= now);

        if (isReservationExpired) {
            await this.handleExpiredReservationRefund(
                booking,
                payment,
                razorpayPaymentId,
                now
            );
            throw new ConflictError(
                "Booking reservation expired before payment completion. Automatic refund has been initiated.",
                "RESERVATION_EXPIRED_REFUND_INITIATED"
            );
        }

        return this.transactionManager.execute(async (transaction) => {
            // Re-read inside transaction to handle concurrent verify + webhook races
            const freshBooking = await this.bookingRepository.findById(
                booking.id!,
                transaction
            );
            const freshPayment = await this.paymentRepository.findById(
                payment.id!,
                transaction
            );

            if (!freshBooking || !freshPayment) {
                throw new ConflictError(
                    "Booking or payment record not found during settlement",
                    "SETTLEMENT_RECORD_MISSING"
                );
            }

            if (
                freshPayment.status === "paid" &&
                freshBooking.status === "confirmed"
            ) {
                const existingAllocation =
                    await this.paymentRepository.findAllocationByBookingId(
                        freshBooking.id!,
                        transaction
                    );
                if (existingAllocation) {
                    return this.buildResponse(
                        freshBooking,
                        freshPayment,
                        existingAllocation
                    );
                }
            }

            if (freshBooking.status !== "pending_payment") {
                throw new ConflictError(
                    `Booking cannot be confirmed from status: ${freshBooking.status}`,
                    "INVALID_BOOKING_STATUS_FOR_PAYMENT"
                );
            }

            const updatedPayment = await this.paymentRepository.updateStatus(
                freshPayment.id!,
                "paid",
                {
                    razorpayPaymentId,
                    ...(razorpaySignature !== undefined
                        ? { razorpaySignature }
                        : {}),
                    paidAt: now,
                },
                ["created", "pending", "failed"],
                transaction
            );

            if (!updatedPayment) {
                const latestPayment = await this.paymentRepository.findById(
                    freshPayment.id!,
                    transaction
                );
                const latestBooking = await this.bookingRepository.findById(
                    freshBooking.id!,
                    transaction
                );
                const existingAllocation =
                    await this.paymentRepository.findAllocationByBookingId(
                        freshBooking.id!,
                        transaction
                    );
                if (
                    latestPayment?.status === "paid" &&
                    latestBooking?.status === "confirmed" &&
                    existingAllocation
                ) {
                    return this.buildResponse(
                        latestBooking,
                        latestPayment,
                        existingAllocation
                    );
                }
                throw new ConflictError(
                    "Payment state changed concurrently",
                    "PAYMENT_CONCURRENT_MODIFICATION"
                );
            }

            const updatedBooking = await this.bookingRepository.updateStatus(
                freshBooking.id!,
                "confirmed",
                {
                    paymentId: updatedPayment.id!,
                    confirmedAt: now,
                },
                ["pending_payment"],
                transaction
            );

            if (!updatedBooking) {
                throw new ConflictError(
                    "Booking reservation could not be confirmed",
                    "BOOKING_CONFIRMATION_FAILED"
                );
            }

            let allocation =
                await this.paymentRepository.findAllocationByBookingId(
                    updatedBooking.id!,
                    transaction
                );

            if (!allocation) {
                const breakdown = getPaymentAllocationBreakdown(
                    updatedPayment.amount
                );
                allocation = await this.paymentRepository.createAllocation(
                    PaymentAllocation.create({
                        paymentId: updatedPayment.id!,
                        bookingId: updatedBooking.id!,
                        mechanicId: updatedBooking.mechanicId,
                        totalAmount: breakdown.totalAmount,
                        superAdminShare: breakdown.superAdminShare,
                        adminShare: breakdown.adminShare,
                        mechanicShare: breakdown.mechanicShare,
                        currency: updatedPayment.currency,
                        status: "allocated",
                        allocatedAt: now,
                    }),
                    transaction
                );
            }

            return this.buildResponse(updatedBooking, updatedPayment, allocation);
        });
    }

    private async handleExpiredReservationRefund(
        booking: Booking,
        payment: Payment,
        razorpayPaymentId: string,
        now: Date
    ): Promise<void> {
        if (booking.status === "pending_payment") {
            await this.bookingRepository.updateStatus(
                booking.id!,
                "expired",
                { expiredAt: now },
                ["pending_payment"]
            );
        }

        if (
            payment.status === "refunded" ||
            payment.status === "refund_requested" ||
            payment.status === "refund_pending"
        ) {
            return;
        }

        try {
            const refund = await this.paymentGateway.refundPayment({
                paymentId: razorpayPaymentId,
                amountPaise: payment.amountPaise,
                notes: {
                    bookingId: booking.id!,
                    reason: "Booking reservation expired",
                },
            });

            if (refund.status === "processed") {
                await this.paymentRepository.updateStatus(payment.id!, "refunded", {
                    razorpayPaymentId,
                    refundId: refund.refundId,
                    refundedAt: now,
                    failureReason: "Reservation expired; payment refunded",
                });
            } else {
                await this.paymentRepository.updateStatus(
                    payment.id!,
                    "refund_requested",
                    {
                        razorpayPaymentId,
                        refundId: refund.refundId,
                        failureReason: `Reservation expired; refund requested (status: ${refund.status})`,
                    }
                );
            }
        } catch (error: unknown) {
            const reason =
                error instanceof Error ? error.message : "Automatic refund failed";
            await this.paymentRepository.updateStatus(
                payment.id!,
                "refund_pending",
                {
                    razorpayPaymentId,
                    failureReason: `Reservation expired; refund pending: ${reason}`,
                }
            );
        }
    }

    private buildResponse(
        booking: Booking,
        payment: Payment,
        allocation: PaymentAllocation
    ): VerifyPaymentResponseDto {
        return {
            bookingId: booking.id!,
            bookingStatus: booking.status,
            paymentId: payment.id!,
            paymentStatus: payment.status,
            razorpayOrderId: payment.razorpayOrderId,
            razorpayPaymentId: payment.razorpayPaymentId ?? "",
            amount: payment.amount,
            currency: payment.currency,
            ...(booking.confirmedAt !== undefined
                ? { confirmedAt: booking.confirmedAt }
                : {}),
            allocation: {
                id: allocation.id!,
                totalAmount: allocation.totalAmount,
                superAdminShare: allocation.superAdminShare,
                adminShare: allocation.adminShare,
                mechanicShare: allocation.mechanicShare,
                currency: allocation.currency,
                status: allocation.status,
                ...(allocation.allocatedAt !== undefined
                    ? { allocatedAt: allocation.allocatedAt }
                    : {}),
            },
        };
    }
}

