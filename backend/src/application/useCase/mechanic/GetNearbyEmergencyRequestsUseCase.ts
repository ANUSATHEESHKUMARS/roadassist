import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequest.js";
import { IMechanicAvailabilityRepository } from "../../../domain/repositories/IMechanicAvailabilityRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { IGetNearbyEmergencyRequestsUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

const DEFAULT_RADIUS_KM = 5;

export class GetNearbyEmergencyRequestsUseCase implements IGetNearbyEmergencyRequestsUseCase {
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly mechanicAvailabilityRepository: IMechanicAvailabilityRepository
    ) {}

    async execute(mechanicId: string): Promise<EmergencyRequest[]> {
        if (!mechanicId || !mechanicId.trim()) {
            throw new BadRequest("Mechanic ID is required");
        }

        const availability = await this.mechanicAvailabilityRepository.findByMechanicId(mechanicId);

        if (!availability || !availability.isAvailable) {
            throw new BadRequest("You must be online to view nearby requests");
        }

        return this.emergencyRequestRepository.findNearbyPending(
            availability.latitude,
            availability.longitude,
            DEFAULT_RADIUS_KM,
            mechanicId
        );
    }
}

