import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IGetAssignedEmergencyRequestDetailsUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

export class GetAssignedEmergencyRequestDetailsUseCase implements IGetAssignedEmergencyRequestDetailsUseCase {
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository
    ) {}

    async execute(requestId: string, mechanicId: string): Promise<{
        request: EmergencyRequest;
        customerDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;
    }> {
        if (!requestId || !requestId.trim()) {
            throw new BadRequest("Request ID is required");
        }

        const result = await this.emergencyRequestRepository.findByIdWithCustomerDetails(requestId);

        if (!result) {
            throw new NotfoundError("Emergency request not found");
        }

        if (result.request.assignedMechanicId !== mechanicId) {
            throw new ForbiddenError("You are not assigned to this request");
        }

       return result
    }
}

