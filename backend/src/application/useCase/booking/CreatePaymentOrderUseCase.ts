import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import { Payment } from "../../../domain/User/entities/Payment.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IPaymentGateway } from "../../contracts/IPaymentGateway.js";
import {
    getBookingAmountInr,
    getBookingCurrency,
} from "../../constants/bookingConfig.js";
import {
    CreatePaymentOrderDto,
    CreatePaymentOrderResponseDto,
} from "../../dtos/booking/ScheduledBookingDtos.js";
import { ICreatePaymentOrderUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

export class CreatePaymentOrderUseCase implements ICreatePaymentOrderUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly paymentRepository: IPaymentRepository,
        private readonly paymentGateway: IPaymentGateway
    ) {}

    async execute(
        userId: string,
        dto: CreatePaymentOrderDto
    ): Promise<CreatePaymentOrderResponseDto> {
        const bookingId = BookingValidator.validateNonEmptyString(
            dto.bookingId,
            "Booking ID"
        );

        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) {
            throw new NotfoundError("Booking not found", "BOOKING_NOT_FOUND");
        }

        if (booking.userId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to pay for this booking",
                "BOOKING_FORBIDDEN"
            );
        }

        if (booking.status === "confirmed") {
            throw new ConflictError(
                "Booking is already confirmed",
                "BOOKING_ALREADY_CONFIRMED"
            );
        }

        if (booking.status !== "pending_payment") {
            throw new ConflictError(
                `Payment cannot be initiated for booking in status: ${booking.status}`,
                "INVALID_BOOKING_STATUS"
            );
        }

        const now = new Date();
        if (booking.reservationExpiresAt && booking.reservationExpiresAt <= now) {
            await this.bookingRepository.updateStatus(
                bookingId,
                "expired",
                { expiredAt: now },
                ["pending_payment"]
            );
            throw new ConflictError(
                "Booking reservation has expired. Please create a new reservation.",
                "RESERVATION_EXPIRED"
            );
        }

        // Idempotency: return existing active order if already created for this booking
        const existingPayment =
            await this.paymentRepository.findLatestByBookingId(bookingId);
        if (
            existingPayment &&
            (existingPayment.status === "created" ||
                existingPayment.status === "pending")
        ) {
            return {
                bookingId,
                paymentId: existingPayment.id!,
                razorpayOrderId: existingPayment.razorpayOrderId,
                amount: existingPayment.amount,
                amountPaise: existingPayment.amountPaise,
                currency: existingPayment.currency,
                keyId: this.paymentGateway.getKeyId(),
                ...(booking.reservationExpiresAt !== undefined
                    ? { reservationExpiresAt: booking.reservationExpiresAt }
                    : {}),
            };
        }

        if (existingPayment && existingPayment.status === "paid") {
            throw new ConflictError(
                "Payment has already been completed for this booking",
                "PAYMENT_ALREADY_COMPLETED"
            );
        }

        const amountInr = getBookingAmountInr();
        const amountPaise = Math.round(amountInr * 100);
        const currency = getBookingCurrency();

        const order = await this.paymentGateway.createOrder({
            amountPaise,
            currency,
            receipt: `bk_${bookingId.slice(-16)}`,
            notes: {
                bookingId,
                userId,
                mechanicId: booking.mechanicId,
            },
        });

        const idempotencyKey = `${bookingId}:${order.orderId}`;

        const payment = Payment.create({
            bookingId,
            userId,
            mechanicId: booking.mechanicId,
            amount: amountInr,
            amountPaise,
            currency,
            razorpayOrderId: order.orderId,
            status: "created",
            idempotencyKey,
            metadata: {
                receipt: order.receipt,
            },
        });

        const savedPayment = await this.paymentRepository.create(payment);
        await this.bookingRepository.attachPaymentId(bookingId, savedPayment.id!);

        return {
            bookingId,
            paymentId: savedPayment.id!,
            razorpayOrderId: savedPayment.razorpayOrderId,
            amount: savedPayment.amount,
            amountPaise: savedPayment.amountPaise,
            currency: savedPayment.currency,
            keyId: this.paymentGateway.getKeyId(),
            ...(booking.reservationExpiresAt !== undefined
                ? { reservationExpiresAt: booking.reservationExpiresAt }
                : {}),
        };
    }
}

