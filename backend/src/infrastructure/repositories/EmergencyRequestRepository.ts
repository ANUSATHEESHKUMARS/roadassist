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
            geoLocation: {
                type: "Point",
                coordinates: [request.location.longitude, request.location.latitude],
            },
            emergencyIssueCategory: request.emergencyIssueCategory,
            issueTitle: request.issueTitle,
            ...(request.issueDescription !== undefined && {
                issueDescription: request.issueDescription
            }),
            issueImages: request.issueImages,
            status: request.status,
            assignedMechanicId: request.assignedMechanicId
                ? new Types.ObjectId(request.assignedMechanicId) :
                null,
            rejectedByMechanicIds: []
        })

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
        const documents = await EmergencyRequestModel.find({
            userId: new Types.ObjectId(userId)
        })
            .sort({ createdAt: -1 })
            .exec()

        return documents.map((doc) => EmergencyRequestMapper.toDomain(doc))
    }

    async findNearbyPending(
        latitude: number,
        longitude: number,
        radiusKm: number,
        excludeMechanicId: string
    ): Promise<EmergencyRequest[]> {
        const radiusInMeters = radiusKm * 1000;
        const mechanicObjectId = new Types.ObjectId(excludeMechanicId);

        const documents = await EmergencyRequestModel.find({
            status: { $in: ["pending", "searching"] },
            geoLocation: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: radiusInMeters,
                },
            },
            rejectedByMechanicIds: { $ne: mechanicObjectId },
            assignedMechanicId: null,
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .exec();

        return documents.map((doc) => EmergencyRequestMapper.toDomain(doc));
    }

    async atomicAccept(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyRequest | null> {
        if (!Types.ObjectId.isValid(requestId)) {
            return null;
        }

        const document = await EmergencyRequestModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(requestId),
                status: { $in: ["pending", "searching"] },
                assignedMechanicId: null,
            },
            {
                $set: {
                    status: "assigned",
                    assignedMechanicId: new Types.ObjectId(mechanicId),
                },
            },
            { new: true }
        ).exec();

        if (!document) {
            return null;
        }

        return EmergencyRequestMapper.toDomain(document);
    }

    async addRejection(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyRequest | null> {
        if (!Types.ObjectId.isValid(requestId)) {
            return null;
        }

        const document = await EmergencyRequestModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(requestId),
                status: { $in: ["pending", "searching"] },
                assignedMechanicId: null,
            },
            {
                $addToSet: {
                    rejectedByMechanicIds: new Types.ObjectId(mechanicId),
                },
            },
            { new: true }
        ).exec();

        if (!document) {
            return null;
        }

        return EmergencyRequestMapper.toDomain(document);
    }

    async findByIdPopulated(requestId: string): Promise<{
        request: EmergencyRequest;
        mechanicDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;
    } | null> {
        if (!Types.ObjectId.isValid(requestId)) {
            return null;
        }

        const document = await EmergencyRequestModel.findById(requestId)
            .populate<{
                assignedMechanicId: {
                    _id: Types.ObjectId;
                    fullName: string;
                    email: string;
                    phoneNumber: string;
                } | null;
            }>("assignedMechanicId", "fullName email phoneNumber")
            .exec();

        if (!document) {
            return null;
        }

        const populatedMechanic = document.assignedMechanicId as unknown as {
            _id: Types.ObjectId;
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;

        // Build domain entity — assignedMechanicId needs to be the string id
        const domainRequest = new EmergencyRequest(
            document.userId.toString(),
            document.vehicleId.toString(),
            {
                latitude: document.location.latitude,
                longitude: document.location.longitude,
                ...(document.location.address !== undefined && {
                    address: document.location.address,
                }),
            },
            document.emergencyIssueCategory,
            document.issueTitle,
            document.issueDescription,
            document.issueImages ?? [],
            document.status,
            populatedMechanic ? populatedMechanic._id.toString() : null,
            (document.rejectedByMechanicIds ?? []).map((id: Types.ObjectId) => id.toString()),
            document._id.toString(),
            document.createdAt,
            document.updatedAt
        );

        const mechanicDetails = populatedMechanic
            ? {
                fullName: populatedMechanic.fullName,
                email: populatedMechanic.email,
                phoneNumber: populatedMechanic.phoneNumber,
            }
            : null;

        return { request: domainRequest, mechanicDetails };
    }
}
