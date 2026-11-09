import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequest.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IGetMechanicAssignedRequestUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

export class GetMechanicAssignedRequestUseCase implements IGetMechanicAssignedRequestUseCase {
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository
    ) {}

    async execute(requestId: string, mechanicId: string): Promise<{
        request: EmergencyRequest;
        mechanicDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;
    }> {
        if (!requestId || !requestId.trim()) {
            throw new BadRequest("Request ID is required");
        }

        const result = await this.emergencyRequestRepository.findByIdPopulated(requestId);

        if (!result) {
            throw new NotfoundError("Emergency request not found");
        }

        // Mechanic must be the assigned mechanic to view details
        if (result.request.assignedMechanicId !== mechanicId) {
            throw new ForbiddenError("You are not assigned to this request");
        }

        return result;
    }
}

