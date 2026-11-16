import type { EmergencyRequest } from "../../domain/User/entities/EmergencyRequest.js";

export interface IGetActiveEmergencyRequestUseCase {
    execute(userId: string): Promise<EmergencyRequest | null>;
}