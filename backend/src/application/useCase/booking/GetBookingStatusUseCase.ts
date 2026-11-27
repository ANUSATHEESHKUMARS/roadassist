import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { BookingStatusResponseDto } from "../../dtos/booking/ScheduledBookingDtos.js";
import { IGetBookingStatusUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

export class GetBookingStatusUseCase implements IGetBookingStatusUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly paymentRepository: IPaymentRepository
    ) {}

    async execute(
        userId: string,
        bookingId: string
    ): Promise<BookingStatusResponseDto> {
        const validBookingId = BookingValidator.validateNonEmptyString(
            bookingId,
            "Booking ID"
        );

        let booking = await this.bookingRepository.findById(validBookingId);
        if (!booking) {
            throw new NotfoundError("Booking not found", "BOOKING_NOT_FOUND");
        }

        if (booking.userId !== userId && booking.mechanicId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to view this booking status",
                "BOOKING_FORBIDDEN"
            );
        }

        const now = new Date();
        if (
            booking.status === "pending_payment" &&
            booking.reservationExpiresAt &&
            booking.reservationExpiresAt <= now
        ) {
            const expired = await this.bookingRepository.updateStatus(
                booking.id!,
                "expired",
                { expiredAt: now },
                ["pending_payment"]
            );
            if (expired) {
                booking = expired;
            }
        }

        const isCustomer = booking.userId === userId;
        const payment = isCustomer
            ? await this.paymentRepository.findLatestByBookingId(booking.id!)
            : null;

        return {
            bookingId: booking.id!,
            status: booking.status,
            scheduledDate: booking.scheduledDate,
            slot: booking.slot,
            bookingAmount: booking.bookingAmount,
            ...(booking.reservationExpiresAt !== undefined
                ? { reservationExpiresAt: booking.reservationExpiresAt }
                : {}),
            ...(booking.confirmedAt !== undefined
                ? { confirmedAt: booking.confirmedAt }
                : {}),
            ...(booking.expiredAt !== undefined
                ? { expiredAt: booking.expiredAt }
                : {}),
            ...(payment
                ? {
                      payment: {
                          paymentId: payment.id!,
                          status: payment.status,
                          razorpayOrderId: payment.razorpayOrderId,
                          ...(payment.razorpayPaymentId !== undefined
                              ? { razorpayPaymentId: payment.razorpayPaymentId }
                              : {}),
                          ...(payment.failureReason !== undefined
                              ? { failureReason: payment.failureReason }
                              : {}),
                          ...(payment.paidAt !== undefined
                              ? { paidAt: payment.paidAt }
                              : {}),
                          ...(payment.refundedAt !== undefined
                              ? { refundedAt: payment.refundedAt }
                              : {}),
                      },
                  }
                : {}),
        };
    }
}

