import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { MechanicBookingActionResponseDto } from "../../dtos/booking/ScheduledBookingDtos.js";
import { ICompleteMechanicBookingUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

export class CompleteMechanicBookingUseCase
    implements ICompleteMechanicBookingUseCase
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
                "Only scheduled bookings can be completed here",
                "INVALID_BOOKING_TYPE"
            );
        }

        if (booking.status !== "in_progress") {
            if (booking.status === "completed") {
                throw new ConflictError(
                    "Service has already been completed",
                    "BOOKING_ALREADY_COMPLETED"
                );
            }
            throw new ConflictError(
                `Cannot complete service before starting (current status: '${booking.status}')`,
                "INVALID_BOOKING_STATUS_TRANSITION"
            );
        }

        const now = new Date();
        const updated = await this.bookingRepository.updateStatus(
            booking.id!,
            "completed",
            { completedAt: now },
            ["in_progress"]
        );

        if (!updated) {
            throw new ConflictError(
                "Booking status changed and can no longer be completed",
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

