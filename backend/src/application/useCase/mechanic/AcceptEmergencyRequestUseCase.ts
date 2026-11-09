import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequest.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IAcceptEmergencyRequestUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

export class AcceptEmergencyRequestUseCase implements IAcceptEmergencyRequestUseCase {
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

        // Verify the request exists
        const existing = await this.emergencyRequestRepository.findById(requestId);

        if (!existing) {
            throw new NotfoundError("Emergency request not found");
        }

        if (existing.status === "assigned" || existing.status === "completed") {
            throw new ConflictError("This request has already been assigned to another mechanic");
        }

        if (existing.status === "cancelled") {
            throw new BadRequest("This request has been cancelled by the user");
        }

        // Atomic accept — only succeeds if status is still pending/searching
        const accepted = await this.emergencyRequestRepository.atomicAccept(
            requestId,
            mechanicId
        );

        if (!accepted) {
            throw new ConflictError("This request has already been accepted by another mechanic");
        }

        return accepted;
    }
}

