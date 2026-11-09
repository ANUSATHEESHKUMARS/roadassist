import { EmergencyRequest } from "../User/entities/EmergencyRequest.js";

export interface IEmergencyRequestRepository {
    create(request: EmergencyRequest): Promise<EmergencyRequest>
    findById(requestId: string): Promise<EmergencyRequest | null>;
    findByUserId(userId: string): Promise<EmergencyRequest[]>

    findNearbyPending(
        latitude: number,
        longitude: number,
        radiusKm: number,
        excludeMechanicId: string
    ): Promise<EmergencyRequest[]>

    atomicAccept(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyRequest | null>

    addRejection(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyRequest | null>

    findByIdPopulated(requestId: string): Promise<{
        request: EmergencyRequest;
        mechanicDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;
    } | null>
}
