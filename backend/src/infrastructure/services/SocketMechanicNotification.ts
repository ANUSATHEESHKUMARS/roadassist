import { Server } from "socket.io";
import { EmergencyRequest } from "../../domain/User/entities/EmergencyRequest.js";
import { IMechanicNotificationService } from "../../application/interfaces/mechanic/IMechanicNotificationService.js";

export class SocketMechanicNotificationService
    implements IMechanicNotificationService {

    constructor(
        private readonly io: Server
    ) {}

    async notifyNewEmergencyRequest(
        mechanicId: string,
        request: EmergencyRequest
    ): Promise<void> {

        const mechanicRoom = `mechanic:${mechanicId}`;

        this.io.to(mechanicRoom).emit("new_emergency_request", {
            id: request.id,
            userId:request.userId,
            vehicleId: request.vehicleId,
            location: request.location,
            emergencyIssueCategory: request.emergencyIssueCategory,
            issueTitle: request.issueTitle,
            issueDescription: request.issueDescription,
            issueImages: request.issueImages,
            status: request.status,
            assignedMechanicId:request.assignedMechanicId,
            rejectedByMechanicIds:request.rejectedByMechanicIds,
            createdAt:request.createdAt,
            updatedAt:request.updatedAt
        });
    }
}