import type { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import { IJoinEmergencyTrackingUseCase } from "../../interfaces/IJoinEmergencytrackingUseCase.js";


export class JoinEmergencyTrackingUseCase
    implements IJoinEmergencyTrackingUseCase {

    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository
    ) {}

    async execute(
        requestId: string,
        userId: string
    ): Promise<void> {

        if (!requestId || !userId) {
            throw new Error("Request ID and user ID are required");
        }

        const request =
            await this.emergencyRequestRepository.findById(requestId);

        if (!request) {
            throw new Error("Emergency request not found");
        }

        if (String(request.userId) !== userId) {
            throw new Error("You are not authorized to track this request");
        }

        // A mechanic must be assigned before tracking can begin.
        if (!request.assignedMechanicId) {
            throw new Error("No mechanic has been assigned yet");
        }

        if (
            request.status !== "assigned" &&
            request.status !== "on_the_way" &&
            request.status !== "arrived"
        ) {
            throw new Error("Live tracking is not available for this request");
        }
    }
}