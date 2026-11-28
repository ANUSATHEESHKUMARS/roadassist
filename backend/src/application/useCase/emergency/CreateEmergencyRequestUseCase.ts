
import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicAvailabilityRepository } from "../../../domain/repositories/IMechanicAvailabilityRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { MechanicAvailability } from "../../../domain/User/entities/MechanicAvailability.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import {
    EMERGENCY_FALLBACK_RADIUS_KM,
    EMERGENCY_PRIMARY_RADIUS_KM,
} from "../../constants/emergencyConfig.js";
import { CreateEmergencyRequestDto } from "../../dtos/CreateEmergencyRequest.js";
import { ICreateEmergencyRequestUseCase } from "../../interfaces/IEmergencyRequestUseCase.js";
import {
    EmergencyVehicleBadge,
    IMechanicNotificationService,
} from "../../interfaces/mechanic/IMechanicNotificationService.js";
import { EmergencyEligibilityService } from "../../services/EmergencyEligibilityService.js";
import { ICreateEmergencyRequestValidator } from "../../validators/interfaces/ICreateEmergencyRequestValidator.js";

export type CreatedEmergencyRequestResult = EmergencyRequest & {
    discoverySummary?: {
        matchedMechanicsCount: number;
        searchRadiusKm: number | null;
        fallbackUsed: boolean;
    };
};

export class CreateEmergencyRequestUseCase implements ICreateEmergencyRequestUseCase {

    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly createRequestValidator: ICreateEmergencyRequestValidator,
        private readonly mechanicAvailabilityRepository: IMechanicAvailabilityRepository,
        private readonly mechanicNotificationService: IMechanicNotificationService,
        private readonly userRepository?: IUserRepository,
        private readonly mechanicApplicationRepository?: IMechanicApplicationRepository,
        private readonly mechanicCategoryRepository?: IMechanicCategoryRepository,
        private readonly bookingRepository?: IBookingRepository
    ) {}

    private async filterEligibleCandidates(
        candidates: MechanicAvailability[],
        vehicleType: string,
        issueCategory: EmergencyRequest["emergencyIssueCategory"],
        latitude: number,
        longitude: number
    ): Promise<Array<{ availability: MechanicAvailability; distanceKm: number }>> {
        if (candidates.length === 0) {
            return [];
        }

        if (!this.userRepository || !this.mechanicApplicationRepository) {
            return candidates.map((availability) => ({
                availability,
                distanceKm: 0,
            }));
        }

        const mechanicIds = candidates.map((c) => c.mechanicId);
        const [users, applications, categories, busyEmergencyIds, busyBookingIds] =
            await Promise.all([
                this.userRepository.findByIds(mechanicIds),
                this.mechanicApplicationRepository.findByUserIds(mechanicIds),
                this.mechanicCategoryRepository
                    ? this.mechanicCategoryRepository.findAll(false)
                    : Promise.resolve([]),
                this.emergencyRequestRepository.findActiveAssignedMechanicIds(
                    mechanicIds
                ),
                this.bookingRepository
                    ? this.bookingRepository.findInProgressMechanicIds(mechanicIds)
                    : Promise.resolve(new Set<string>()),
            ]);

        const userMap = new Map(
            users.filter((u) => u.userId).map((u) => [u.userId!, u])
        );
        const appMap = new Map(
            applications.map((a) => [a.userId, a])
        );

        const now = new Date();
        const eligible: Array<{
            availability: MechanicAvailability;
            distanceKm: number;
        }> = [];

        for (const availability of candidates) {
            const hasIncompatibleActiveJob =
                busyEmergencyIds.has(availability.mechanicId) ||
                busyBookingIds.has(availability.mechanicId);

            const check = EmergencyEligibilityService.checkMechanicEligibility({
                availability,
                user: userMap.get(availability.mechanicId),
                application: appMap.get(availability.mechanicId),
                vehicleType,
                issueCategory,
                customerLatitude: latitude,
                customerLongitude: longitude,
                categories,
                hasIncompatibleActiveJob,
                now,
            });

            if (check.eligible) {
                eligible.push({
                    availability,
                    distanceKm: Number((check.distanceKm ?? 0).toFixed(2)),
                });
            }
        }

        return eligible.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    async execute(
        userId: string,
        dto: CreateEmergencyRequestDto
    ): Promise<CreatedEmergencyRequestResult> {

        this.createRequestValidator.validate(dto);

        if (!userId || !userId.trim()) {
            throw new UnauthorizedError(
                "Authentication user Id is required",
                "AUTHENTICATION_IS_REQUIRED"
            );
        }

        const activeRequest =
            await this.emergencyRequestRepository.findActiveByUserId(userId);

        if (activeRequest) {
            throw new ConflictError(
                "You already have an active emergency request",
                "ACTIVE_EMERGENCY_REQUEST_EXISTS"
            );
        }

        const vehicle = await this.vehicleRepository.findById(dto.vehicleId);

        if (!vehicle) {
            throw new ForbiddenError(
                "Vehicle not found",
                "VEHICLE_NOT_FOUND"
            );
        }

        if (vehicle.userId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to use this vehicle"
            );
        }

        const emergencyRequest = new EmergencyRequest(
            userId,
            dto.vehicleId,
            {
                latitude: dto.location.latitude,
                longitude: dto.location.longitude,
                ...(dto.location.address !== undefined && {
                    address: dto.location.address.trim()
                })
            },
            dto.emergencyIssueCategory,
            dto.issueTitle.trim(),
            dto.issueDescription?.trim(),
            dto.issueImages ?? [],
            "searching",
            null
        );

        const savedRequest =
            await this.emergencyRequestRepository.create(emergencyRequest);

        let searchRadiusKm: number | null = EMERGENCY_PRIMARY_RADIUS_KM;
        let fallbackUsed = false;

        const primaryCandidates =
            await this.mechanicAvailabilityRepository.findNearbyAvailableMechanics(
                dto.location.latitude,
                dto.location.longitude,
                EMERGENCY_PRIMARY_RADIUS_KM
            );

        let eligibleMechanics = await this.filterEligibleCandidates(
            primaryCandidates,
            vehicle.vehicleType,
            dto.emergencyIssueCategory,
            dto.location.latitude,
            dto.location.longitude
        );

        if (eligibleMechanics.length === 0) {
            fallbackUsed = true;
            searchRadiusKm = EMERGENCY_FALLBACK_RADIUS_KM;

            const fallbackCandidates =
                await this.mechanicAvailabilityRepository.findNearbyAvailableMechanics(
                    dto.location.latitude,
                    dto.location.longitude,
                    EMERGENCY_FALLBACK_RADIUS_KM
                );

            eligibleMechanics = await this.filterEligibleCandidates(
                fallbackCandidates,
                vehicle.vehicleType,
                dto.emergencyIssueCategory,
                dto.location.latitude,
                dto.location.longitude
            );
        }

        if (eligibleMechanics.length === 0) {
            searchRadiusKm = null;
        }

        const vehicleSummary: EmergencyVehicleBadge = {
            vehicleId: vehicle.id!,
            brand: vehicle.brand,
            model: vehicle.model,
            registrationNumber: vehicle.registrationNumber,
            vehicleType: vehicle.vehicleType,
        };

        const notificationResults = await Promise.allSettled(
            eligibleMechanics.map(({ availability, distanceKm }) =>
                this.mechanicNotificationService.notifyNewEmergencyRequest(
                    availability.mechanicId,
                    savedRequest,
                    {
                        distanceKm,
                        vehicleSummary,
                    }
                )
            )
        );

        notificationResults.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                    `Failed to notify mechanic ${eligibleMechanics[index]?.availability.mechanicId}:`,
                    result.reason
                );
            }
        });

        return Object.assign(savedRequest, {
            discoverySummary: {
                matchedMechanicsCount: eligibleMechanics.length,
                searchRadiusKm,
                fallbackUsed,
            },
        });
    }
}
