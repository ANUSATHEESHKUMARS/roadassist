import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { IGetMechanicAcceptedRequestsUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

export class GetMechanicAcceptedRequestsUseCase
    implements IGetMechanicAcceptedRequestsUseCase {

    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository
    ) {}

    async execute(mechanicId: string): Promise<EmergencyRequest[]> {

        if (!mechanicId || !mechanicId.trim()) {
            throw new BadRequest("Mechanic ID is required");
        }

        return this.emergencyRequestRepository.findByAssignedMechanicId(mechanicId);
    }
}