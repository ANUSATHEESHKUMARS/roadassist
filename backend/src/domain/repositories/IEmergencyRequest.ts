import { EmergencyRequest } from "../User/entities/EmergencyRequest.js";

export interface IEmergencyRequestRepository {
    create(request: EmergencyRequest): Promise<EmergencyRequest>
    findById(requestId: string): Promise<EmergencyRequest | null>;
    findByUserId(userId: string): Promise<EmergencyRequest[]>
}

