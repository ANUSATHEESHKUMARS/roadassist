
import { Booking } from "../../../domain/User/entities/Booking.js";
import { BookingSlot } from "../../../domain/User/Types/BookingTypes.js";
import { CreateSlotBookingDto } from "../../dtos/CreateSlotBookingDto.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";

import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { isShiftWindowPassedForDate } from "../../../shared/utils/timezone.js";
import { MechanicAvailabilityResolver } from "../../services/MechanicAvailabilityResolver.js";
import { MechanicServiceCompatibility } from "../../services/MechanicServiceCompatibility.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

const BOOKING_AMOUNT = 800;

export class CreateSlotBookingUseCase {

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository,
        private readonly mechanicScheduleRepository: IMechanicScheduleRepository,
        private readonly bookingRepository: IBookingRepository,
        private readonly mechanicCategoryRepository?: IMechanicCategoryRepository
    ) {}

    async execute(
        userId: string,
        dto: CreateSlotBookingDto
    ): Promise<Booking> {

        // 1. Validate the booking date
        const scheduledDate = BookingValidator.parseAndValidateDate(
            dto.scheduledDate
        );

        // 2. Validate the selected slot
        const validSlots: BookingSlot[] = [
            "morning",
            "afternoon",
            "full_day"
        ];

        if (!validSlots.includes(dto.slot)) {
            throw new BadRequest("Invalid booking slot");
        }

        // 3. Find and validate the customer's vehicle
        const vehicle = await this.vehicleRepository.findById(
            dto.vehicleId
        );

        if (!vehicle) {
            throw new NotfoundError("Vehicle not found");
        }

        if (vehicle.userId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to book using this vehicle"
            );
        }

        // 4. Validate the mechanic's user account
        const mechanic = await this.userRepository.findById(
            dto.mechanicId
        );

        if (!mechanic) {
            throw new NotfoundError("Mechanic not found");
        }

        if (mechanic.status !== "active") {
            throw new ForbiddenError("Mechanic account is not active");
        }

        if (!mechanic.roles.includes("mechanic")) {
            throw new ForbiddenError(
                "Selected user is not registered as a mechanic"
            );
        }

        // 5. Validate mechanic application
        const application =
            await this.mechanicApplicationRepository.findByUserId(
                dto.mechanicId
            );

        if (!application || application.status !== "approved") {
            throw new ForbiddenError(
                "Mechanic application is not approved"
            );
        }

        // 6. Validate supported vehicle type
        if (
            !MechanicServiceCompatibility.supportsVehicleType(
                application,
                vehicle.vehicleType
            )
        ) {
            throw new BadRequest(
                "Mechanic does not support this vehicle type"
            );
        }

        // 7. Validate offered service (serviceOffered or approved specializations)
        const categories = this.mechanicCategoryRepository
            ? await this.mechanicCategoryRepository.findAll(false)
            : [];
        if (
            !MechanicServiceCompatibility.offersService(
                application,
                dto.serviceType,
                categories
            )
        ) {
            throw new BadRequest(
                "Mechanic does not offer this service"
            );
        }

        // 8. Validate mechanic schedule
        const schedule =
            await this.mechanicScheduleRepository.findByMechanicId(
                dto.mechanicId
            );

        if (!schedule || !schedule.isActive) {
            throw new ConflictError(
                "Mechanic does not have an active schedule"
            );
        }

        const resolvedAvailability =
            MechanicAvailabilityResolver.resolveForDate(schedule, scheduledDate);

        if (!resolvedAvailability.isAvailable) {
            throw new ConflictError(
                "Mechanic is not available on this day",
                "DAY_UNAVAILABLE"
            );
        }

        if (
            !MechanicAvailabilityResolver.isSlotAvailable(
                resolvedAvailability,
                dto.slot
            )
        ) {
            throw new ConflictError(
                "Mechanic is not available for the selected shift",
                "SHIFT_UNAVAILABLE"
            );
        }

        if (
            isShiftWindowPassedForDate(scheduledDate, dto.slot, {
                morningStartTime: resolvedAvailability.morningStartTime,
                morningEndTime: resolvedAvailability.morningEndTime,
                afternoonStartTime: resolvedAvailability.afternoonStartTime,
                afternoonEndTime: resolvedAvailability.afternoonEndTime,
            })
        ) {
            throw new BadRequest(
                "Selected shift time window has already passed for today",
                "SHIFT_WINDOW_PASSED"
            );
        }

        // 9. Check for an existing conflicting booking
        const conflictingBooking =
            await this.bookingRepository.findConflictingBooking(
                dto.mechanicId,
                scheduledDate,
                dto.slot
            );

        if (conflictingBooking) {
            throw new ConflictError(
                "This mechanic is already booked for the selected slot"
            );
        }

        // 10. Create the booking domain entity
        const booking = Booking.create({
            userId,
            vehicleId: dto.vehicleId,
            mechanicId: dto.mechanicId,

            bookingType: "scheduled",

            serviceType: dto.serviceType.trim(),
            serviceAddress: dto.serviceAddress.trim(),

            scheduledDate,
            slot: dto.slot,

            bookingAmount: BOOKING_AMOUNT,
            status: "pending"
        });

        // 11. Persist the booking
        return await this.bookingRepository.create(booking);
    }
}
