import { Types } from "mongoose";
import { IEmergencyRequestRepository } from "../../domain/repositories/IEmergencyRequest.js";
import { EmergencyRequest } from "../../domain/User/entities/EmergencyRequest.js";
import { EmergencyRequestModel } from "../databases/models/EmergencyRequestModel.js";
import { EmergencyRequestMapper } from "../../application/mappers/EmergencyRequestMapper.js";

export class EmergencyRequestRepository implements IEmergencyRequestRepository {
    async create(request: EmergencyRequest): Promise<EmergencyRequest> {
        const document = await EmergencyRequestModel.create({
            userId: new Types.ObjectId(request.userId),
            vehicleId: new Types.ObjectId(request.vehicleId),

            location: {
                latitude: request.location.latitude,
                longitude: request.location.longitude,
                ...(request.location.address !== undefined && {
                    address: request.location.address
                }),
            },
            issueDescription: request.issueDescription,
            status: request.status,
            assignedMechanicId: request.assignedMechanicId
                ? new Types.ObjectId(request.assignedMechanicId) :
                null
        })
        console.log("Saved vehicleId:", document.vehicleId);

        return EmergencyRequestMapper.toDomain(document)
    }

    async findById(requestId: string): Promise<EmergencyRequest | null> {
        if (!Types.ObjectId.isValid(requestId)) {
            return null
        }
        const document = await EmergencyRequestModel.findById(requestId).exec();
        if (!document) {
            return null
        }
        return EmergencyRequestMapper.toDomain(document)
    }
    async findByUserId(userId: string): Promise<EmergencyRequest[]> {
        if (!Types.ObjectId.isValid(userId)) {
            return []
        }
        const document = await EmergencyRequestModel.find({
            userId: new Types.ObjectId(userId)
        })
            .sort({ createdAt: -1 })
            .exec()

        return document.map((document) => EmergencyRequestMapper.toDomain(document))
    }
}

