import { EmergencyRequest } from "../../domain/User/entities/EmergencyRequest.js";
import { IEmergencyRequestDocument } from "../../infrastructure/databases/models/EmergencyRequestModel.js";

export class EmergencyRequestMapper {
    static toDomain(document: IEmergencyRequestDocument): EmergencyRequest {
        return new EmergencyRequest(
            document.userId.toString(),
            document.vehicleId.toString(),
            {
                latitude: document.location.latitude,
                longitude: document.location.longitude,
                ...(document.location.address !== undefined && {
                    address: document.location.address,
                })
            },
            document.issueDescription,
            document.status,
            document.assignedMechanicId?.toString() ?? null,

            document._id.toString(),
            document.createdAt,
            document.updatedAt
        )
    }
}


