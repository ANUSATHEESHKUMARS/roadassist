import type { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import type { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import type { IConfirmArrivalUseCase } from "../../interfaces/mechanic/IConfirmArrivalUseCase.js";

export class ConfirmArrivalUseCase implements IConfirmArrivalUseCase {

    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository
    ) {}

    async execute(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyRequest> {

        if (!requestId || !requestId.trim()) {
            throw new BadRequest(
                "Request ID is required",
                "REQUEST_ID_REQUIRED"
            );
        }

        if (!mechanicId || !mechanicId.trim()) {
            throw new BadRequest(
                "Mechanic ID is required",
                "MECHANIC_ID_REQUIRED"
            );
        }

        const existingRequest =
            await this.emergencyRequestRepository.findById(requestId);

        if (!existingRequest) {
            throw new NotfoundError(
                "Emergency request not found",
                "EMERGENCY_REQUEST_NOT_FOUND"
            );
        }

        if (existingRequest.assignedMechanicId !== mechanicId) {
            throw new ConflictError(
                "You are not assigned to this emergency request",
                "NOT_ASSIGNED_TO_REQUEST"
            );
        }

        if (existingRequest.status !== "on_the_way") {
            throw new ConflictError(
                "Arrival can only be confirmed when status is on_the_way",
                "INVALID_STATUS_TRANSITION"
            );
        }

        const updatedRequest =
            await this.emergencyRequestRepository.updateAssignedRequestStatus(
                requestId,
                mechanicId,
                "on_the_way",
                "arrived"
            );

        if (!updatedRequest) {
            throw new ConflictError(
                "Unable to confirm arrival. The request status may have changed."
            );
        }

        return updatedRequest;
    }
}

