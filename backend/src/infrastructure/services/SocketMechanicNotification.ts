import { Server } from "socket.io";
import { EmergencyRequest } from "../../domain/User/entities/EmergencyRequest.js";
import {
    EmergencyMechanicSummary,
    EmergencyVehicleBadge,
    IMechanicNotificationService,
} from "../../application/interfaces/mechanic/IMechanicNotificationService.js";

export class SocketMechanicNotificationService
    implements IMechanicNotificationService {

    constructor(
        private io?: Server
    ) {}

    setServer(io: Server): void {
        this.io = io;
    }

    async notifyNewEmergencyRequest(
        mechanicId: string,
        request: EmergencyRequest,
        metadata?: {
            distanceKm?: number;
            vehicleSummary?: EmergencyVehicleBadge;
        }
    ): Promise<void> {
        if (!this.io) return;

        const mechanicRoom = `mechanic:${mechanicId}`;

        this.io.to(mechanicRoom).emit("new_emergency_request", {
            id: request.id,
            userId: request.userId,
            vehicleId: request.vehicleId,
            location: request.location,
            emergencyIssueCategory: request.emergencyIssueCategory,
            issueTitle: request.issueTitle,
            issueDescription: request.issueDescription,
            issueImages: request.issueImages,
            status: request.status,
            assignedMechanicId: request.assignedMechanicId,
            rejectedByMechanicIds: request.rejectedByMechanicIds,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
            ...(metadata?.distanceKm !== undefined
                ? { distanceKm: metadata.distanceKm }
                : {}),
            ...(metadata?.vehicleSummary !== undefined
                ? { vehicleSummary: metadata.vehicleSummary }
                : {}),
        });
    }

    async notifyRequestTaken(
        requestId: string,
        assignedMechanicId: string
    ): Promise<void> {
        if (!this.io) return;

        this.io.to("mechanics:online").emit("emergency_request_taken", {
            requestId,
            assignedMechanicId,
        });
    }

    async notifyCustomerRequestUpdated(
        request: EmergencyRequest,
        options?: {
            eventName?: string;
            mechanicDetails?: EmergencyMechanicSummary | null;
            extraPayload?: Record<string, unknown>;
        }
    ): Promise<void> {
        if (!this.io || !request.id) return;

        const userRoom = `user:${request.userId}`;
        const trackingRoom = `emergency-tracking:${request.id}`;

        const basePayload = {
            requestId: request.id,
            request,
            status: request.status,
            ...(options?.mechanicDetails !== undefined
                ? { mechanicDetails: options.mechanicDetails }
                : {}),
            ...(options?.extraPayload ?? {}),
        };

        this.io.to(userRoom).to(trackingRoom).emit("emergency_status_updated", basePayload);

        if (options?.eventName && options.eventName !== "emergency_status_updated") {
            this.io.to(userRoom).to(trackingRoom).emit(options.eventName, basePayload);
        }
    }

    async notifyMechanicRequestUpdated(
        mechanicId: string,
        requestId: string,
        eventName: string,
        payload: Record<string, unknown>
    ): Promise<void> {
        if (!this.io || !mechanicId) return;

        const mechanicRoom = `mechanic:${mechanicId}`;
        this.io.to(mechanicRoom).emit(eventName, {
            requestId,
            ...payload,
        });
    }
}