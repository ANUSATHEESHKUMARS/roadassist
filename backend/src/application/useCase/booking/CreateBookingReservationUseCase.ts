import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { Booking } from "../../../domain/User/entities/Booking.js";
import { ITransactionManager } from "../../../infrastructure/databases/interface/IMongoTransactionManger.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { isShiftWindowPassedForDate } from "../../../shared/utils/timezone.js";
import {
    getBookingAmountInr,
    getBookingCurrency,
    getReservationExpiryMinutes,
} from "../../constants/bookingConfig.js";
import {
    CreateBookingReservationDto,
    CreateBookingReservationResponseDto,
} from "../../dtos/booking/ScheduledBookingDtos.js";
import { ICreateBookingReservationUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { MechanicAvailabilityResolver } from "../../services/MechanicAvailabilityResolver.js";
import { MechanicLocationResolver } from "../../services/MechanicLocationResolver.js";
import { MechanicServiceCompatibility } from "../../services/MechanicServiceCompatibility.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

export class CreateBookingReservationUseCase
    implements ICreateBookingReservationUseCase
{
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository,
        private readonly mechanicScheduleRepository: IMechanicScheduleRepository,
        private readonly bookingRepository: IBookingRepository,
        private readonly transactionManager: ITransactionManager,
        private readonly mechanicCategoryRepository?: IMechanicCategoryRepository
    ) {}

    async execute(
        userId: string,
        dto: CreateBookingReservationDto
    ): Promise<CreateBookingReservationResponseDto> {
        const scheduledDate = BookingValidator.parseAndValidateDate(dto.scheduledDate);
        const slot = BookingValidator.validateSlot(dto.slot);
        const mechanicId = BookingValidator.validateNonEmptyString(
            dto.mechanicId,
            "Mechanic ID"
        );
        const vehicleId = BookingValidator.validateNonEmptyString(
            dto.vehicleId,
            "Vehicle ID"
        );
        const serviceType = BookingValidator.validateNonEmptyString(
            dto.serviceType,
            "Service type"
        );
        const serviceAddress = BookingValidator.validateNonEmptyString(
            dto.serviceAddress,
            "Service address"
        );
        const problemDescription = BookingValidator.validateProblemDescription(
            dto.problemDescription
        );
        const { latitude, longitude } = BookingValidator.validateCoordinates(
            dto.latitude,
            dto.longitude
        );

        const vehicle = await this.vehicleRepository.findById(vehicleId);
        if (!vehicle) {
            throw new NotfoundError("Vehicle not found", "VEHICLE_NOT_FOUND");
        }
        if (vehicle.userId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to book using this vehicle",
                "VEHICLE_FORBIDDEN"
            );
        }

        const mechanic = await this.userRepository.findById(mechanicId);
        if (!mechanic) {
            throw new NotfoundError("Mechanic not found", "MECHANIC_NOT_FOUND");
        }
        if (mechanic.status !== "active") {
            throw new ForbiddenError(
                "Mechanic account is not active",
                "MECHANIC_INACTIVE"
            );
        }
        if (!mechanic.roles.includes("mechanic")) {
            throw new ForbiddenError(
                "Selected user is not registered as a mechanic",
                "NOT_A_MECHANIC"
            );
        }

        const application =
            await this.mechanicApplicationRepository.findByUserId(mechanicId);
        if (!application || application.status !== "approved") {
            throw new ForbiddenError(
                "Mechanic application is not approved",
                "MECHANIC_NOT_APPROVED"
            );
        }

        if (
            !MechanicServiceCompatibility.supportsVehicleType(
                application,
                vehicle.vehicleType
            )
        ) {
            throw new BadRequest(
                "Mechanic does not support this vehicle type",
                "UNSUPPORTED_VEHICLE_TYPE"
            );
        }

        const categories = this.mechanicCategoryRepository
            ? await this.mechanicCategoryRepository.findAll(false)
            : [];

        if (
            !MechanicServiceCompatibility.offersService(
                application,
                serviceType,
                categories
            )
        ) {
            throw new BadRequest(
                "Mechanic does not offer this service",
                "SERVICE_NOT_OFFERED"
            );
        }

        if (!MechanicLocationResolver.hasValidDiscoveryLocation(application)) {
            throw new BadRequest(
                "Mechanic service location is not configured",
                "MECHANIC_LOCATION_UNAVAILABLE"
            );
        }

        const resolvedLocation = MechanicLocationResolver.resolveForCustomer(
            application,
            latitude,
            longitude,
            dto.serviceMode
        );
        if (!resolvedLocation) {
            throw new BadRequest(
                "Selected mechanic is outside the service radius",
                "OUTSIDE_SERVICE_RADIUS"
            );
        }

        const schedule =
            await this.mechanicScheduleRepository.findByMechanicId(mechanicId);
        if (!schedule || !schedule.isActive) {
            throw new ConflictError(
                "Mechanic does not have an active schedule",
                "SCHEDULE_INACTIVE"
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
                slot
            )
        ) {
            throw new ConflictError(
                "Mechanic is not available for the selected shift",
                "SHIFT_UNAVAILABLE"
            );
        }

        const now = new Date();
        if (
            isShiftWindowPassedForDate(
                scheduledDate,
                slot,
                {
                    morningStartTime: resolvedAvailability.morningStartTime,
                    morningEndTime: resolvedAvailability.morningEndTime,
                    afternoonStartTime:
                        resolvedAvailability.afternoonStartTime,
                    afternoonEndTime: resolvedAvailability.afternoonEndTime,
                },
                now
            )
        ) {
            throw new BadRequest(
                "Selected shift time window has already passed for today",
                "SHIFT_WINDOW_PASSED"
            );
        }

        // Expire any stale reservations first
        await this.bookingRepository.expireStaleReservations(now);

        const expiryMinutes = getReservationExpiryMinutes();
        const reservationExpiresAt = new Date(
            now.getTime() + expiryMinutes * 60 * 1000
        );
        const bookingAmount = getBookingAmountInr();

        const createdBooking = await this.transactionManager.execute(
            async (transaction) => {
                const conflictingBooking =
                    await this.bookingRepository.findConflictingBooking(
                        mechanicId,
                        scheduledDate,
                        slot,
                        undefined,
                        transaction
                    );

                if (conflictingBooking) {
                    throw new ConflictError(
                        "This mechanic is already booked or reserved for the selected slot",
                        "SLOT_ALREADY_RESERVED"
                    );
                }

                const reservation = Booking.create({
                    userId,
                    vehicleId,
                    mechanicId,
                    bookingType: "scheduled",
                    serviceType,
                    ...(problemDescription !== undefined
                        ? { problemDescription }
                        : {}),
                    serviceAddress,
                    latitude,
                    longitude,
                    scheduledDate,
                    slot,
                    bookingAmount,
                    status: "pending_payment",
                    reservationExpiresAt,
                    requestedAt: now,
                });

                return this.bookingRepository.create(reservation, transaction);
            }
        );

        return {
            bookingId: createdBooking.id!,
            status: createdBooking.status,
            mechanicId: createdBooking.mechanicId,
            vehicleId: createdBooking.vehicleId,
            serviceType: createdBooking.serviceType,
            ...(createdBooking.problemDescription !== undefined
                ? { problemDescription: createdBooking.problemDescription }
                : {}),
            serviceAddress: createdBooking.serviceAddress,
            scheduledDate: createdBooking.scheduledDate,
            slot: createdBooking.slot,
            bookingAmount: createdBooking.bookingAmount,
            currency: getBookingCurrency(),
            reservationExpiresAt,
        };
    }
}

