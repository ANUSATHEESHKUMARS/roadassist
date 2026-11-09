import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequest.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IRejectEmergencyRequestUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

export class RejectEmergencyRequestUseCase implements IRejectEmergencyRequestUseCase {
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository
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

        if (existing.status === "assigned" || existing.status === "completed" || existing.status === "cancelled") {
            throw new BadRequest("This request is no longer available");
        }

        const rejected = await this.emergencyRequestRepository.addRejection(
            requestId,
            mechanicId
        );

        if (!rejected) {
            throw new BadRequest("Unable to reject this request");
        }

        return rejected;
    }
}

