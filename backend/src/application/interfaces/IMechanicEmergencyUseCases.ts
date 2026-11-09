import { MechanicAvailability } from "../../domain/User/entities/MechanicAvailability.js";
import { EmergencyRequest } from "../../domain/User/entities/EmergencyRequest.js";

export interface IUpdateMechanicAvailabilityUseCase {
    execute(
        mechanicId: string,
        isAvailable: boolean,
        latitude: number,
        longitude: number
    ): Promise<MechanicAvailability>;
}

export interface IGetNearbyEmergencyRequestsUseCase {
    execute(mechanicId: string): Promise<EmergencyRequest[]>;
}

export interface IAcceptEmergencyRequestUseCase {
    execute(requestId: string, mechanicId: string): Promise<EmergencyRequest>;
}

export interface IRejectEmergencyRequestUseCase {
    execute(requestId: string, mechanicId: string): Promise<EmergencyRequest>;
}

export interface IGetEmergencyRequestStatusUseCase {
    execute(requestId: string, userId: string): Promise<{
        request: EmergencyRequest;
        mechanicDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;
    }>;
}

export interface IGetUserEmergencyRequestsUseCase {
    execute(userId: string): Promise<EmergencyRequest[]>;
}

export interface IGetMechanicAssignedRequestUseCase {
    execute(requestId: string, mechanicId: string): Promise<{
        request: EmergencyRequest;
        mechanicDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;
    }>;
}

