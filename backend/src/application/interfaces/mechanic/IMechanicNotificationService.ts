import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import type { Server } from "socket.io";

export interface EmergencyVehicleBadge {
    vehicleId: string;
    brand: string;
    model: string;
    registrationNumber: string;
    vehicleType: string;
}

export interface EmergencyMechanicSummary {
    mechanicId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

export interface IMechanicNotificationService {
    setServer?(io: Server): void;

    notifyNewEmergencyRequest(
        mechanicId: string,
        request: EmergencyRequest,
        metadata?: {
            distanceKm?: number;
            vehicleSummary?: EmergencyVehicleBadge;
        }
    ): Promise<void>;

    notifyRequestTaken(
        requestId: string,
        assignedMechanicId: string
    ): Promise<void>;

    notifyCustomerRequestUpdated(
        request: EmergencyRequest,
        options?: {
            eventName?: string;
            mechanicDetails?: EmergencyMechanicSummary | null;
            extraPayload?: Record<string, unknown>;
        }
    ): Promise<void>;

    notifyMechanicRequestUpdated(
        mechanicId: string,
        requestId: string,
        eventName: string,
        payload: Record<string, unknown>
    ): Promise<void>;
}