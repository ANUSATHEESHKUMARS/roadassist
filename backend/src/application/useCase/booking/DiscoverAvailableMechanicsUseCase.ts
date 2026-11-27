import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { isShiftWindowPassedForDate } from "../../../shared/utils/timezone.js";
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
import { MechanicAvailabilityResolver } from "../../services/MechanicAvailabilityResolver.js";
import { MechanicLocationResolver } from "../../services/MechanicLocationResolver.js";
import { MechanicServiceCompatibility } from "../../services/MechanicServiceCompatibility.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

export class DiscoverAvailableMechanicsUseCase
    implements IDiscoverAvailableMechanicsUseCase
{
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

        const diagnosticsEnabled =
            process.env.NODE_ENV === "development" ||
            process.env.DEBUG_BOOKING_DISCOVERY === "true";

        // Filter 3: Approved mechanic applications + active categories for specialization matching
        const [approvedApps, categories] = await Promise.all([
            this.mechanicApplicationRepository.findByStatus("approved"),
            this.mechanicCategoryRepository
                ? this.mechanicCategoryRepository.findAll(false)
                : Promise.resolve([]),
        ]);

        // Pre-filter by vehicle type, service offered/specializations, and valid coordinates/radius
        const candidateApps = approvedApps.filter((app) => {
            const vehicleOk = MechanicServiceCompatibility.supportsVehicleType(
                app,
                vehicle.vehicleType
            );
            const serviceOk = MechanicServiceCompatibility.offersService(
                app,
                serviceType,
                categories
            );
            const locationConfigOk =
                MechanicLocationResolver.hasValidDiscoveryLocation(app);

            if (
                diagnosticsEnabled &&
                (!vehicleOk || !serviceOk || !locationConfigOk)
            ) {
                console.debug("[DiscoverMechanics][PreFilter]", {
                    mechanicId: app.userId,
                    applicationApproved: app.status === "approved",
                    vehicleCompatibility: vehicleOk ? "PASS" : "FAIL",
                    serviceCompatibility: serviceOk ? "PASS" : "FAIL",
                    locationConfigured: locationConfigOk ? "PASS" : "FAIL",
                    serviceRadiusKm: app.serviceRadiusKm ?? null,
                    eligible: false,
                });
            }

            return vehicleOk && serviceOk && locationConfigOk;
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
            const accountActive = Boolean(
                mechanicUser && mechanicUser.status === "active"
            );
            const hasMechanicRole = Boolean(
                mechanicUser && mechanicUser.roles.includes("mechanic")
            );
            const schedule = scheduleMap.get(app.userId);
            const scheduleActive = Boolean(schedule && schedule.isActive);

            const resolvedAvailability = schedule
                ? MechanicAvailabilityResolver.resolveForDate(
                      schedule,
                      scheduledDate
                  )
                : null;
            const slotAvailable = resolvedAvailability
                ? MechanicAvailabilityResolver.isSlotAvailable(
                      resolvedAvailability,
                      slot
                  )
                : false;
            const shiftPassed = resolvedAvailability
                ? isShiftWindowPassedForDate(
                      scheduledDate,
                      slot,
                      {
                          morningStartTime:
                              resolvedAvailability.morningStartTime,
                          morningEndTime: resolvedAvailability.morningEndTime,
                          afternoonStartTime:
                              resolvedAvailability.afternoonStartTime,
                          afternoonEndTime:
                              resolvedAvailability.afternoonEndTime,
                      },
                      now
                  )
                : false;
            const resolvedLocation =
                MechanicLocationResolver.resolveForCustomer(
                    app,
                    latitude,
                    longitude,
                    dto.serviceMode
                );
            const hasConflict = conflictingMechanicIds.has(app.userId);

            const isEligible =
                accountActive &&
                hasMechanicRole &&
                scheduleActive &&
                slotAvailable &&
                !shiftPassed &&
                resolvedLocation !== null &&
                !hasConflict;

            if (diagnosticsEnabled) {
                console.debug("[DiscoverMechanics][Candidate]", {
                    mechanicId: app.userId,
                    applicationApproved: "PASS",
                    accountActive: accountActive ? "PASS" : "FAIL",
                    mechanicRole: hasMechanicRole ? "PASS" : "FAIL",
                    vehicleCompatibility: "PASS",
                    serviceCompatibility: "PASS",
                    scheduleActive: scheduleActive ? "PASS" : "FAIL",
                    availabilitySource:
                        resolvedAvailability?.source ?? "missing",
                    slotAvailable: slotAvailable ? "PASS" : "FAIL",
                    shiftWindowActive: !shiftPassed ? "PASS" : "FAIL",
                    effectiveTimings: resolvedAvailability
                        ? {
                              morning: `${resolvedAvailability.morningStartTime}-${resolvedAvailability.morningEndTime}`,
                              afternoon: `${resolvedAvailability.afternoonStartTime}-${resolvedAvailability.afternoonEndTime}`,
                          }
                        : null,
                    calculatedDistanceKm: resolvedLocation?.distanceKm ?? null,
                    configuredServiceRadiusKm: app.serviceRadiusKm ?? null,
                    locationDistance: resolvedLocation ? "PASS" : "FAIL",
                    bookingConflict: !hasConflict ? "PASS" : "FAIL",
                    eligible: isEligible,
                });
            }

            if (!isEligible || !mechanicUser || !resolvedAvailability || !resolvedLocation) {
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
                distanceKm: resolvedLocation.distanceKm,
                serviceRadiusKm: resolvedLocation.serviceRadiusKm,
                morningStartTime: resolvedAvailability.morningStartTime,
                morningEndTime: resolvedAvailability.morningEndTime,
                afternoonStartTime: resolvedAvailability.afternoonStartTime,
                afternoonEndTime: resolvedAvailability.afternoonEndTime,
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

