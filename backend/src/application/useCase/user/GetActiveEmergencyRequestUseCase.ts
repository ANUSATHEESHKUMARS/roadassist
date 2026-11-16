
import type { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";

import type { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";


import type { IGetActiveEmergencyRequestUseCase } from "../../interfaces/IGetActiveEmergencyRequestUseCase.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

export class GetActiveEmergencyRequestUseCase
    implements IGetActiveEmergencyRequestUseCase {

    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository
    ) {}

    async execute(userId: string): Promise<EmergencyRequest | null> {

        if (!userId || !userId.trim()) {
            throw new UnauthorizedError(
                "Authentication user Id is required",
                "AUTHENTICATION_IS_REQUIRED"
            );
        }

        return await this.emergencyRequestRepository.findActiveByUserId(userId);
    }
}