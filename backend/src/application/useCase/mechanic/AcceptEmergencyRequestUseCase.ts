import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicAvailabilityRepository } from "../../../domain/repositories/IMechanicAvailabilityRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IAcceptEmergencyRequestUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";
import { IMechanicNotificationService } from "../../interfaces/mechanic/IMechanicNotificationService.js";
import { EmergencyEligibilityService } from "../../services/EmergencyEligibilityService.js";

export class AcceptEmergencyRequestUseCase implements IAcceptEmergencyRequestUseCase {
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly userRepository?: IUserRepository,
        private readonly mechanicApplicationRepository?: IMechanicApplicationRepository,
        private readonly mechanicAvailabilityRepository?: IMechanicAvailabilityRepository,
        private readonly vehicleRepository?: IVehicleRepository,
        private readonly mechanicCategoryRepository?: IMechanicCategoryRepository,
        private readonly bookingRepository?: IBookingRepository,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(requestId: string, mechanicId: string): Promise<EmergencyRequest> {
        if (!requestId || !requestId.trim()) {
            throw new BadRequest("Request ID is required");
        }

        if (!mechanicId || !mechanicId.trim()) {
            throw new BadRequest("Mechanic ID is required");
        }

        const existing = await this.emergencyRequestRepository.findById(requestId);

        if (!existing) {
            throw new NotfoundError("Emergency request not found");
        }

        if (
            existing.status === "assigned" ||
            existing.status === "on_the_way" ||
            existing.status === "arrived" ||
            existing.status === "completed"
        ) {
            throw new ConflictError("This request has already been assigned to another mechanic");
        }

        if (existing.status === "cancelled") {
            throw new BadRequest("This request has been cancelled by the user");
        }

        // Verify mechanic eligibility, active job exclusivity, and vehicle/service compatibility
        const [
            mechanicUser,
            application,
            availability,
            vehicle,
            categories,
            busyEmergencyIds,
            busyBookingIds,
        ] = await Promise.all([
            this.userRepository
                ? this.userRepository.findById(mechanicId)
                : Promise.resolve(null),
            this.mechanicApplicationRepository
                ? this.mechanicApplicationRepository.findByUserId(mechanicId)
                : Promise.resolve(null),
            this.mechanicAvailabilityRepository
                ? this.mechanicAvailabilityRepository.findByMechanicId(mechanicId)
                : Promise.resolve(null),
            this.vehicleRepository
                ? this.vehicleRepository.findById(existing.vehicleId)
                : Promise.resolve(null),
            this.mechanicCategoryRepository
                ? this.mechanicCategoryRepository.findAll(false)
                : Promise.resolve([]),
            this.emergencyRequestRepository.findActiveAssignedMechanicIds(
                [mechanicId],
                requestId
            ),
            this.bookingRepository
                ? this.bookingRepository.findInProgressMechanicIds([mechanicId])
                : Promise.resolve(new Set<string>()),
        ]);

        if (
            this.userRepository &&
            this.mechanicApplicationRepository &&
            this.mechanicAvailabilityRepository &&
            vehicle
        ) {
            const check = EmergencyEligibilityService.checkMechanicEligibility({
                availability,
                user: mechanicUser,
                application,
                vehicleType: vehicle.vehicleType,
                issueCategory: existing.emergencyIssueCategory,
                customerLatitude: existing.location.latitude,
                customerLongitude: existing.location.longitude,
                categories,
                hasIncompatibleActiveJob:
                    busyEmergencyIds.has(mechanicId) || busyBookingIds.has(mechanicId),
            });

            if (!check.eligible) {
                throw new ForbiddenError(
                    check.reason || "You are not eligible to accept this emergency request",
                    "MECHANIC_INELIGIBLE"
                );
            }
        } else if (busyEmergencyIds.has(mechanicId) || busyBookingIds.has(mechanicId)) {
            throw new ConflictError(
                "Complete your current active emergency request or repair before accepting another",
                "MECHANIC_BUSY"
            );
        }

        const accepted = await this.emergencyRequestRepository.atomicAccept(
            requestId,
            mechanicId
        );

        if (!accepted) {
            throw new ConflictError("This request has already been accepted by another mechanic");
        }

        if (this.notificationService) {
            const mechanicDetails = mechanicUser
                ? {
                      mechanicId,
                      fullName: mechanicUser.fullName,
                      email: mechanicUser.email,
                      phoneNumber: mechanicUser.phoneNumber,
                  }
                : null;

            await Promise.allSettled([
                this.notificationService.notifyCustomerRequestUpdated(accepted, {
                    eventName: "emergency_request_accepted",
                    mechanicDetails,
                }),
                this.notificationService.notifyRequestTaken(requestId, mechanicId),
            ]);
        }

        return accepted;
    }
}

