import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicAvailabilityRepository } from "../../../domain/repositories/IMechanicAvailabilityRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import {
    EMERGENCY_FALLBACK_RADIUS_KM,
    EMERGENCY_PRIMARY_RADIUS_KM,
} from "../../constants/emergencyConfig.js";
import { IGetNearbyEmergencyRequestsUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";
import { EmergencyEligibilityService } from "../../services/EmergencyEligibilityService.js";
import { MechanicServiceCompatibility } from "../../services/MechanicServiceCompatibility.js";

export type NearbyEmergencyRequestItem = EmergencyRequest & {
    distanceKm?: number;
    vehicleSummary?: {
        vehicleId: string;
        brand: string;
        model: string;
        registrationNumber: string;
        vehicleType: string;
    };
};

export class GetNearbyEmergencyRequestsUseCase
    implements IGetNearbyEmergencyRequestsUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly mechanicAvailabilityRepository: IMechanicAvailabilityRepository,
        private readonly userRepository?: IUserRepository,
        private readonly mechanicApplicationRepository?: IMechanicApplicationRepository,
        private readonly vehicleRepository?: IVehicleRepository,
        private readonly mechanicCategoryRepository?: IMechanicCategoryRepository,
        private readonly bookingRepository?: IBookingRepository
    ) {}

    async execute(mechanicId: string): Promise<NearbyEmergencyRequestItem[]> {
        if (!mechanicId || !mechanicId.trim()) {
            throw new BadRequest("Mechanic ID is required");
        }

        const availability =
            await this.mechanicAvailabilityRepository.findByMechanicId(mechanicId);

        if (!availability || !availability.isAvailable) {
            throw new BadRequest("You must be online to view nearby requests");
        }

        const now = new Date();
        if (!EmergencyEligibilityService.isLocationFresh(availability.updatedAt, now)) {
            throw new BadRequest(
                "Your live location has expired. Please refresh your online location toggle.",
                "STALE_MECHANIC_LOCATION"
            );
        }

        const [mechanicUser, application, categories, busyEmergencyIds, busyBookingIds] =
            await Promise.all([
                this.userRepository
                    ? this.userRepository.findById(mechanicId)
                    : Promise.resolve(null),
                this.mechanicApplicationRepository
                    ? this.mechanicApplicationRepository.findByUserId(mechanicId)
                    : Promise.resolve(null),
                this.mechanicCategoryRepository
                    ? this.mechanicCategoryRepository.findAll(false)
                    : Promise.resolve([]),
                this.emergencyRequestRepository.findActiveAssignedMechanicIds([
                    mechanicId,
                ]),
                this.bookingRepository
                    ? this.bookingRepository.findInProgressMechanicIds([mechanicId])
                    : Promise.resolve(new Set<string>()),
            ]);

        if (this.userRepository) {
            if (
                !mechanicUser ||
                mechanicUser.status !== "active" ||
                !mechanicUser.roles.includes("mechanic")
            ) {
                throw new ForbiddenError(
                    "Your mechanic account is not active",
                    "MECHANIC_INACTIVE"
                );
            }
        }

        if (this.mechanicApplicationRepository) {
            if (!application || application.status !== "approved") {
                throw new ForbiddenError(
                    "Mechanic application must be approved before receiving emergency requests",
                    "MECHANIC_NOT_APPROVED"
                );
            }
        }

        if (busyEmergencyIds.has(mechanicId) || busyBookingIds.has(mechanicId)) {
            return [];
        }

        const filterAndEnrich = async (
            requests: EmergencyRequest[]
        ): Promise<NearbyEmergencyRequestItem[]> => {
            if (requests.length === 0) return [];

            const vehicles = this.vehicleRepository
                ? await this.vehicleRepository.findByIds(
                      requests.map((r) => r.vehicleId)
                  )
                : [];
            const vehicleMap = new Map(
                vehicles.filter((v) => v.id).map((v) => [v.id!, v])
            );

            const eligible: EmergencyRequest[] = [];
            for (const req of requests) {
                const vehicle = vehicleMap.get(req.vehicleId);
                if (application && vehicle) {
                    if (
                        !MechanicServiceCompatibility.supportsVehicleType(
                            application,
                            vehicle.vehicleType
                        )
                    ) {
                        continue;
                    }
                    if (
                        !EmergencyEligibilityService.supportsEmergencyCategory(
                            application,
                            req.emergencyIssueCategory,
                            categories
                        )
                    ) {
                        continue;
                    }
                }
                eligible.push(req);
            }

            const sorted = EmergencyEligibilityService.sortRequestsByDistance(
                eligible,
                availability.latitude,
                availability.longitude
            );

            return sorted.map(({ request, distanceKm }) => {
                const vehicle = vehicleMap.get(request.vehicleId);
                return Object.assign(request, {
                    distanceKm,
                    ...(vehicle
                        ? {
                              vehicleSummary: {
                                  vehicleId: vehicle.id!,
                                  brand: vehicle.brand,
                                  model: vehicle.model,
                                  registrationNumber:
                                      vehicle.registrationNumber,
                                  vehicleType: vehicle.vehicleType,
                              },
                          }
                        : {}),
                });
            });
        };

        const primaryRequests =
            await this.emergencyRequestRepository.findNearbyPending(
                availability.latitude,
                availability.longitude,
                EMERGENCY_PRIMARY_RADIUS_KM,
                mechanicId
            );

        const primaryEligible = await filterAndEnrich(primaryRequests);
        if (primaryEligible.length > 0) {
            return primaryEligible;
        }

        const fallbackRequests =
            await this.emergencyRequestRepository.findNearbyPending(
                availability.latitude,
                availability.longitude,
                EMERGENCY_FALLBACK_RADIUS_KM,
                mechanicId
            );

        return filterAndEnrich(fallbackRequests);
    }
}

