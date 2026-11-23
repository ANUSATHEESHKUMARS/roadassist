import { Types } from "mongoose";
import { IEmergencyRequestRepository } from "../../domain/repositories/IEmergencyRequestRepository.js";
import { EmergencyRequest, EmergencyRequestStatus } from "../../domain/User/entities/EmergencyRequest.js";
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

    async findActiveByUserId(
        userId: string
    ): Promise<EmergencyRequest | null> {

        if (!Types.ObjectId.isValid(userId)) {
            return null;
        }

        const document = await EmergencyRequestModel.findOne({
            userId: new Types.ObjectId(userId),
            status: {
                $in: [
                    "pending",
                    "searching",
                    "assigned",
                    "on_the_way",
                    "arrived"
                ]
            }
        })
            .sort({ createdAt: -1 })
            .exec();

        if (!document) {
            return null;
        }

        return EmergencyRequestMapper.toDomain(document);
    }

  
async findNearbyPending(
    latitude: number,
    longitude: number,
    radiusKm: number,
    excludeMechanicId: string
): Promise<EmergencyRequest[]> {

    try {
        const radiusInMeters = radiusKm * 1000;

        const mechanicObjectId = new Types.ObjectId(
            excludeMechanicId
        );

        // Step 1: Log database connection details
        console.log("========== GEO QUERY DEBUG ==========");

        console.log(
            "Database:",
            EmergencyRequestModel.db.name
        );

        console.log(
            "Host:",
            EmergencyRequestModel.db.host
        );

        console.log(
            "Collection:",
            EmergencyRequestModel.collection.name
        );

        // Step 2: Inspect existing indexes
        const indexes =
            await EmergencyRequestModel.collection.indexes();

        console.log(
            "GEO INDEX:",
            indexes.filter(
                index => index.key.geoLocation
            )
        );

        // Step 3: Log query parameters
        console.log("Search coordinates:", {
            latitude,
            longitude
        });

        console.log("Radius in meters:", radiusInMeters);

        console.log("Excluded mechanic:", excludeMechanicId);

        console.log("=====================================");

        // Step 4: Execute nearby emergency request query
        const documents = await EmergencyRequestModel.find({
            status: {
                $in: ["pending", "searching"]
            },

            geoLocation: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radiusInMeters
                }
            },

            rejectedByMechanicIds: {
                $ne: mechanicObjectId
            },

            assignedMechanicId: null

        })
            .limit(20)
            .exec();

        console.log(
            "Nearby emergency requests found:",
            documents.length
        );

        // Step 5: Map MongoDB documents to domain entities
        return documents.map(document =>
            EmergencyRequestMapper.toDomain(document)
        );

    } catch (error) {
        console.error(
            "FIND NEARBY PENDING ERROR:",
            error
        );

        throw error;
    }
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


    async findByIdWithCustomerDetails(
        requestId: string
    ): Promise<{
        request: EmergencyRequest;
        customerDetails: {
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
                userId: {
                    _id: Types.ObjectId;
                    fullName: string;
                    email: string;
                    phoneNumber: string;
                } | null;
            }>("userId", "fullName email phoneNumber")
            .exec();

        if (!document) {
            return null;
        }
        const populatedUser = document.userId;

        if (!populatedUser || typeof populatedUser !== "object") {
            return null;
        }

        const customerId = populatedUser._id.toString();

        const domainRequest = new EmergencyRequest(
            customerId,
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
            document.assignedMechanicId
                ? document.assignedMechanicId.toString()
                : null,
            (document.rejectedByMechanicIds ?? []).map(
                (id: Types.ObjectId) => id.toString()
            ),
            document._id.toString(),
            document.createdAt,
            document.updatedAt
        );

        const customerDetails = {
            fullName: populatedUser.fullName,
            email: populatedUser.email,
            phoneNumber: populatedUser.phoneNumber,
        };

        return {
            request: domainRequest,
            customerDetails,
        };
    }

    async findByAssignedMechanicId(
        mechanicId: string
    ): Promise<EmergencyRequest[]> {

        if (!Types.ObjectId.isValid(mechanicId)) {
            return [];
        }

        const documents = await EmergencyRequestModel.find({
            assignedMechanicId: new Types.ObjectId(mechanicId),
            status: ["assigned", "on_the_way", "arrived"]
        })
            .sort({ createdAt: -1 })
            .exec();

        return documents.map((doc) =>
            EmergencyRequestMapper.toDomain(doc)
        );
    }

    async updateAssignedRequestStatus(
        requestId: string,
        mechanicId: string,
        currentStatus: EmergencyRequestStatus,
        newStatus: EmergencyRequestStatus
    ): Promise<EmergencyRequest | null> {

        if (
            !Types.ObjectId.isValid(requestId) ||
            !Types.ObjectId.isValid(mechanicId)
        ) {
            return null;
        }

        const document = await EmergencyRequestModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(requestId),
                assignedMechanicId: new Types.ObjectId(mechanicId),
                status: currentStatus
            },
            {
                $set: {
                    status: newStatus
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).exec();

        if (!document) {
            return null;
        }

        return EmergencyRequestMapper.toDomain(document);
    }
}
