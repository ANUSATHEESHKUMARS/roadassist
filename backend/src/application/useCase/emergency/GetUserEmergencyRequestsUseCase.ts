import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequest.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { IGetUserEmergencyRequestsUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

export class GetUserEmergencyRequestsUseCase implements IGetUserEmergencyRequestsUseCase {
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository
    ) {}

    async execute(userId: string): Promise<EmergencyRequest[]> {
        if (!userId || !userId.trim()) {
            throw new BadRequest("User ID is required");
        }

        return this.emergencyRequestRepository.findByUserId(userId);
    }
}

