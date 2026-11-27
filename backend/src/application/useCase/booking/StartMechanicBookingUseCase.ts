import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { MechanicBookingActionResponseDto } from "../../dtos/booking/ScheduledBookingDtos.js";
import { IStartMechanicBookingUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

export class StartMechanicBookingUseCase
    implements IStartMechanicBookingUseCase
{
    constructor(private readonly bookingRepository: IBookingRepository) {}

    async execute(
        mechanicId: string,
        bookingId: string
    ): Promise<MechanicBookingActionResponseDto> {
        const validBookingId = BookingValidator.validateNonEmptyString(
            bookingId,
            "Booking ID"
        );

        const booking = await this.bookingRepository.findById(validBookingId);
        if (!booking) {
            throw new NotfoundError("Booking not found", "BOOKING_NOT_FOUND");
        }

        if (booking.mechanicId !== mechanicId) {
            throw new ForbiddenError(
                "You are not authorized to manage this booking",
                "BOOKING_FORBIDDEN"
            );
        }

        if (booking.bookingType !== "scheduled") {
            throw new BadRequest(
                "Only scheduled bookings can be started here",
                "INVALID_BOOKING_TYPE"
            );
        }

        if (booking.status !== "confirmed") {
            if (booking.status === "in_progress") {
                throw new ConflictError(
                    "Service has already been started",
                    "BOOKING_ALREADY_IN_PROGRESS"
                );
            }
            throw new ConflictError(
                `Cannot start service when booking status is '${booking.status}'`,
                "INVALID_BOOKING_STATUS_TRANSITION"
            );
        }

        const now = new Date();
        const updated = await this.bookingRepository.updateStatus(
            booking.id!,
            "in_progress",
            { startedAt: now },
            ["confirmed"]
        );

        if (!updated) {
            throw new ConflictError(
                "Booking status changed and can no longer be started",
                "BOOKING_STATE_CONFLICT"
            );
        }

        return {
            bookingId: updated.id!,
            status: updated.status,
            ...(updated.startedAt !== undefined
                ? { startedAt: updated.startedAt }
                : {}),
            ...(updated.completedAt !== undefined
                ? { completedAt: updated.completedAt }
                : {}),
            ...(updated.updatedAt !== undefined
                ? { updatedAt: updated.updatedAt }
                : {}),
        };
    }
}

