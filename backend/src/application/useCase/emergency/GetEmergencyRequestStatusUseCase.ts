import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequest.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IGetEmergencyRequestStatusUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

export class GetEmergencyRequestStatusUseCase implements IGetEmergencyRequestStatusUseCase {
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository
    ) {}

    async execute(requestId: string, userId: string): Promise<{
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

        // Ensure the user owns this request
        if (result.request.userId !== userId) {
            throw new ForbiddenError("You are not authorized to view this request");
        }

        return result;
    }
}

