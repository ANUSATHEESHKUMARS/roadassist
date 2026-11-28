import type { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import type { IEmergencyRepairRepository } from "../../../domain/repositories/IEmergencyWorkflowRepositories.js";
import type { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import type { ICancelEmergencyRequestUseCase } from "../../interfaces/emergency/IEmergencyWorkflowUseCases.js";
import type { IMechanicLocationStore } from "../../interfaces/mechanic/IMechanicLocationStore.js";
import type { IMechanicNotificationService } from "../../interfaces/mechanic/IMechanicNotificationService.js";

export class CancelEmergencyRequestUseCase
    implements ICancelEmergencyRequestUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly repairRepository?: IEmergencyRepairRepository,
        private readonly locationStore?: IMechanicLocationStore,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(
        requestId: string,
        userId: string,
        reason?: string
    ): Promise<EmergencyRequest> {
        if (!requestId || !requestId.trim()) {
            throw new BadRequest("Request ID is required", "REQUEST_ID_REQUIRED");
        }
        if (!userId || !userId.trim()) {
            throw new BadRequest("User ID is required", "USER_ID_REQUIRED");
        }

        const existing = await this.emergencyRequestRepository.findById(requestId);
        if (!existing) {
            throw new NotfoundError(
                "Emergency request not found",
                "EMERGENCY_REQUEST_NOT_FOUND"
            );
        }

        if (existing.userId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to cancel this emergency request",
                "FORBIDDEN"
            );
        }

        if (existing.status === "completed") {
            throw new ConflictError(
                "Completed emergency requests cannot be cancelled",
                "REQUEST_ALREADY_COMPLETED"
            );
        }

        if (existing.status === "cancelled") {
            throw new ConflictError(
                "This emergency request is already cancelled",
                "REQUEST_ALREADY_CANCELLED"
            );
        }

        if (this.repairRepository) {
            const repair = await this.repairRepository.findByEmergencyRequestId(
                requestId
            );
            if (repair && repair.status !== "pending") {
                throw new ConflictError(
                    "Cannot cancel after repair has started",
                    "REPAIR_ALREADY_STARTED"
                );
            }
        }

        const cancelled = await this.emergencyRequestRepository.cancelByCustomer(
            requestId,
            userId,
            reason
        );

        if (!cancelled) {
            throw new ConflictError(
                "Unable to cancel emergency request in its current state",
                "CANCELLATION_CONFLICT"
            );
        }

        if (this.locationStore) {
            await this.locationStore.delete(requestId).catch(() => undefined);
        }

        if (this.notificationService) {
            await this.notificationService.notifyCustomerRequestUpdated(cancelled, {
                eventName: "emergency_request_cancelled",
            });
            if (cancelled.assignedMechanicId) {
                await this.notificationService.notifyMechanicRequestUpdated(
                    cancelled.assignedMechanicId,
                    requestId,
                    "emergency_request_cancelled",
                    {
                        request: cancelled,
                        reason: cancelled.cancellationReason,
                    }
                );
            }
        }

        return cancelled;
    }
}

