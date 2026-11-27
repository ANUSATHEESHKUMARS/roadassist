import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IPaymentGateway } from "../../contracts/IPaymentGateway.js";
import {
    VerifyPaymentDto,
    VerifyPaymentResponseDto,
} from "../../dtos/booking/ScheduledBookingDtos.js";
import { IVerifyPaymentUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { BookingValidator } from "../../validators/BookingValidator.js";
import { PaymentSettlementHelper } from "./PaymentSettlementHelper.js";

export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly paymentRepository: IPaymentRepository,
        private readonly paymentGateway: IPaymentGateway,
        private readonly settlementHelper: PaymentSettlementHelper
    ) {}

    async execute(
        userId: string,
        dto: VerifyPaymentDto
    ): Promise<VerifyPaymentResponseDto> {
        const bookingId = BookingValidator.validateNonEmptyString(
            dto.bookingId,
            "Booking ID"
        );
        const razorpayOrderId = BookingValidator.validateNonEmptyString(
            dto.razorpayOrderId,
            "Razorpay Order ID"
        );
        const razorpayPaymentId = BookingValidator.validateNonEmptyString(
            dto.razorpayPaymentId,
            "Razorpay Payment ID"
        );
        const razorpaySignature = BookingValidator.validateNonEmptyString(
            dto.razorpaySignature,
            "Razorpay Signature"
        );

        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new NotfoundError("Booking not found", "BOOKING_NOT_FOUND");
        }
        if (booking.userId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to verify payment for this booking",
                "BOOKING_FORBIDDEN"
            );
        }

        const payment =
            await this.paymentRepository.findByRazorpayOrderId(razorpayOrderId);
        if (!payment || payment.bookingId !== bookingId) {
            throw new NotfoundError(
                "Payment order not found for this booking",
                "PAYMENT_ORDER_NOT_FOUND"
            );
        }

        if (
            payment.status === "refunded" ||
            payment.status === "refund_requested" ||
            payment.status === "refund_pending"
        ) {
            throw new BadRequest(
                "Payment is already refunded or pending refund",
                "PAYMENT_REFUND_IN_PROGRESS"
            );
        }

        // Verify signature BEFORE any state mutation so forged attempts cannot corrupt Payment state
        const isSignatureValid = this.paymentGateway.verifyPaymentSignature({
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            signature: razorpaySignature,
        });

        if (!isSignatureValid) {
            throw new BadRequest(
                "Invalid payment signature",
                "INVALID_PAYMENT_SIGNATURE"
            );
        }

        // Case: Duplicate verification call on an already-paid payment
        if (payment.status === "paid" && booking.status === "confirmed") {
            if (
                payment.razorpayPaymentId &&
                payment.razorpayPaymentId !== razorpayPaymentId
            ) {
                throw new BadRequest(
                    "Payment ID mismatch for already settled order",
                    "PAYMENT_ID_MISMATCH"
                );
            }
            return this.settlementHelper.settleOrRefund({
                booking,
                payment,
                razorpayPaymentId: payment.razorpayPaymentId ?? razorpayPaymentId,
                razorpaySignature: payment.razorpaySignature ?? razorpaySignature,
            });
        }

        // Verify payment status & amount from Razorpay gateway (never trust client)
        const gatewayPayment =
            await this.paymentGateway.fetchPayment(razorpayPaymentId);

        if (gatewayPayment.orderId !== razorpayOrderId) {
            throw new BadRequest(
                "Payment order mismatch",
                "PAYMENT_ORDER_MISMATCH"
            );
        }

        if (
            gatewayPayment.amount !== payment.amountPaise ||
            gatewayPayment.currency.toUpperCase() !== payment.currency
        ) {
            await this.paymentRepository.updateStatus(
                payment.id!,
                "failed",
                {
                    razorpayPaymentId,
                    failureReason: "Payment amount or currency mismatch",
                },
                ["created", "pending"]
            );
            throw new BadRequest(
                "Payment amount or currency mismatch",
                "PAYMENT_AMOUNT_MISMATCH"
            );
        }

        if (gatewayPayment.status !== "captured" && !gatewayPayment.captured) {
            await this.paymentRepository.updateStatus(
                payment.id!,
                "failed",
                {
                    razorpayPaymentId,
                    failureReason: `Payment not captured (status: ${gatewayPayment.status})`,
                },
                ["created", "pending"]
            );
            throw new BadRequest(
                "Payment has not been captured",
                "PAYMENT_NOT_CAPTURED"
            );
        }

        return this.settlementHelper.settleOrRefund({
            booking,
            payment,
            razorpayPaymentId,
            razorpaySignature,
        });
    }
}

