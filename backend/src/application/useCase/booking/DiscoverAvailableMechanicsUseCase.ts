import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { calculateDistanceKm } from "../../../shared/utils/haversine.js";
import {
    getIndiaDateParts,
    isShiftWindowPassedForDate,
} from "../../../shared/utils/timezone.js";
import {
    getBookingAmountInr,
    getBookingCurrency,
} from "../../constants/bookingConfig.js";
import {
    DiscoveredMechanicItem,
    DiscoverMechanicsDto,
    DiscoverMechanicsResponseDto,
} from "../../dtos/booking/ScheduledBookingDtos.js";
import { IDiscoverAvailableMechanicsUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

export class DiscoverAvailableMechanicsUseCase
    implements IDiscoverAvailableMechanicsUseCase
{
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository,
        private readonly mechanicScheduleRepository: IMechanicScheduleRepository,
        private readonly bookingRepository: IBookingRepository
    ) {}

    async execute(
        userId: string,
        dto: DiscoverMechanicsDto
    ): Promise<DiscoverMechanicsResponseDto> {
        const scheduledDate = BookingValidator.parseAndValidateDate(dto.scheduledDate);
        const slot = BookingValidator.validateSlot(dto.slot);
        const serviceType = BookingValidator.validateNonEmptyString(
            dto.serviceType,
            "Service type"
        );
        const vehicleId = BookingValidator.validateNonEmptyString(
            dto.vehicleId,
            "Vehicle ID"
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
                "You are not authorized to discover mechanics for this vehicle",
                "VEHICLE_FORBIDDEN"
            );
        }

        // Expire stale pending_payment reservations before checking conflicts
        await this.bookingRepository.expireStaleReservations(new Date());

        // Filter 3: Approved mechanic applications
        const approvedApps =
            await this.mechanicApplicationRepository.findByStatus("approved");

        const dateParts = getIndiaDateParts(scheduledDate);
        const dayOfWeek = dateParts.dayOfWeek;

        // Pre-filter by vehicle type, service offered, and valid coordinates/radius
        const candidateApps = approvedApps.filter((app) => {
            if (!app.supportedVehicleTypes.includes(vehicle.vehicleType)) {
                return false;
            }
            if (!app.serviceOffered.includes(serviceType)) {
                return false;
            }
            if (
                app.latitude === undefined ||
                app.longitude === undefined ||
                app.serviceRadiusKm === undefined ||
                app.serviceRadiusKm <= 0
            ) {
                return false;
            }
            return true;
        });

        const candidateMechanicIds = candidateApps.map((app) => app.userId);

        if (candidateMechanicIds.length === 0) {
            return {
                scheduledDate: scheduledDate.toISOString(),
                slot,
                bookingAmount: getBookingAmountInr(),
                currency: getBookingCurrency(),
                mechanics: [],
            };
        }

        const [users, schedules, conflictingMechanicIds] = await Promise.all([
            this.userRepository.findByIds(candidateMechanicIds),
            this.mechanicScheduleRepository.findActiveByMechanicIds(
                candidateMechanicIds
            ),
            this.bookingRepository.findConflictingMechanicIds(
                candidateMechanicIds,
                scheduledDate,
                slot
            ),
        ]);

        const userMap = new Map(users.map((u) => [u.userId!, u]));
        const scheduleMap = new Map(schedules.map((s) => [s.mechanicId, s]));

        const eligibleMechanics: DiscoveredMechanicItem[] = [];
        const now = new Date();

        for (const app of candidateApps) {
            const mechanicUser = userMap.get(app.userId);
            // Filters 1 & 2: Active user with mechanic role
            if (
                !mechanicUser ||
                mechanicUser.status !== "active" ||
                !mechanicUser.roles.includes("mechanic")
            ) {
                continue;
            }

            // Filter 4: Active schedule
            const schedule = scheduleMap.get(app.userId);
            if (!schedule || !schedule.isActive) {
                continue;
            }

            // Filter 5: Weekday enabled
            const dailySchedule = schedule.weeklyAvailability.find(
                (item) => item.day === dayOfWeek
            );
            if (!dailySchedule) {
                continue;
            }

            // Filter 6: Shift available & not already past for today in Asia/Kolkata
            const shiftAvailable =
                slot === "morning"
                    ? dailySchedule.morning
                    : slot === "afternoon"
                      ? dailySchedule.afternoon
                      : dailySchedule.morning && dailySchedule.afternoon;

            if (!shiftAvailable) {
                continue;
            }

            if (
                isShiftWindowPassedForDate(
                    scheduledDate,
                    slot,
                    {
                        morningStartTime: schedule.morningStartTime,
                        morningEndTime: schedule.morningEndTime,
                        afternoonStartTime: schedule.afternoonStartTime,
                        afternoonEndTime: schedule.afternoonEndTime,
                    },
                    now
                )
            ) {
                continue;
            }

            // Filter 9: Within service radius (Haversine)
            const distanceKm = calculateDistanceKm(
                latitude,
                longitude,
                app.latitude!,
                app.longitude!
            );
            if (distanceKm > app.serviceRadiusKm!) {
                continue;
            }

            // Filter 10: No conflicting bookings
            if (conflictingMechanicIds.has(app.userId)) {
                continue;
            }

            eligibleMechanics.push({
                mechanicId: app.userId,
                fullName: mechanicUser.fullName,
                ...(app.serviceModel !== undefined
                    ? { serviceModel: app.serviceModel }
                    : {}),
                ...(app.serviceAddress !== undefined
                    ? { serviceAddress: app.serviceAddress }
                    : {}),
                ...(app.workshopName !== undefined
                    ? { workshopName: app.workshopName }
                    : {}),
                ...(app.workshopAddress !== undefined
                    ? { workshopAddress: app.workshopAddress }
                    : {}),
                ...(app.experienceYears !== undefined
                    ? { experienceYears: app.experienceYears }
                    : {}),
                distanceKm,
                serviceRadiusKm: app.serviceRadiusKm!,
                morningStartTime: schedule.morningStartTime,
                morningEndTime: schedule.morningEndTime,
                afternoonStartTime: schedule.afternoonStartTime,
                afternoonEndTime: schedule.afternoonEndTime,
            });
        }

        eligibleMechanics.sort((a, b) => a.distanceKm - b.distanceKm);

        return {
            scheduledDate: scheduledDate.toISOString(),
            slot,
            bookingAmount: getBookingAmountInr(),
            currency: getBookingCurrency(),
            mechanics: eligibleMechanics,
        };
    }
}

