import { IMechanicAvailabilityRepository } from "../../../domain/repositories/IMechanicAvailabilityRepository.js";
import { MechanicAvailability } from "../../../domain/User/entities/MechanicAvailability.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { IUpdateMechanicAvailabilityUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

export class UpdateMechanicAvailabilityUseCase implements IUpdateMechanicAvailabilityUseCase {
    constructor(
        private readonly mechanicAvailabilityRepository: IMechanicAvailabilityRepository
    ) {}

    async execute(
        mechanicId: string,
        isAvailable: boolean,
        latitude: number,
        longitude: number
    ): Promise<MechanicAvailability> {
        if (!mechanicId || !mechanicId.trim()) {
            throw new BadRequest("Mechanic ID is required");
        }

        if (latitude < -90 || latitude > 90) {
            throw new BadRequest("Invalid latitude value");
        }

        if (longitude < -180 || longitude > 180) {
            throw new BadRequest("Invalid longitude value");
        }

        return this.mechanicAvailabilityRepository.upsert(
            mechanicId,
            isAvailable,
            latitude,
            longitude
        );
    }
}

