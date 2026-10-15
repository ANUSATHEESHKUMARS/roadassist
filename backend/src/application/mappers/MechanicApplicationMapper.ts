
import { Types } from "mongoose";

import {
    MechanicApplication,
    MechanicApplicationProps,
} from "../../domain/User/entities/MechanicApplication.js";

import { IMechanicApplicationDocument } from "../../infrastructure/databases/models/MechanicApplicationModel.js";

export class MechanicApplicationMapper {

    
static toPersistence(application: MechanicApplication) {
    return {
        userId: new Types.ObjectId(application.userId),

        ...(application.profilePhotoKey !== undefined && {
            profilePhotoKey: application.profilePhotoKey,
        }),

        ...(application.experienceYears !== undefined && {
            experienceYears: application.experienceYears,
        }),

        specialization: application.specializations,
        supportedVehicleTypes: application.supportedVehicleType,
        serviceOffered: application.serviceOffered,

        ...(application.professionalDescription !== undefined && {
            professionalDescription: application.professionalDescription,
        }),

        ...(application.serviceModel !== undefined && {
            serviceModel: application.serviceModel,
        }),

        ...(application.serviceAddress !== undefined && {
            serviceAddress: application.serviceAddress,
        }),

        ...(application.latitude !== undefined && {
            latitude: application.latitude,
        }),

        ...(application.longitude !== undefined && {
            longitude: application.longitude,
        }),

        ...(application.serviceRadiusKm !== undefined && {
            serviceRadiusKm: application.serviceRadiusKm,
        }),

        ...(application.workshopName !== undefined && {
            workshopName: application.workshopName,
        }),

        ...(application.workshopAddress !== undefined && {
            workshopAddress: application.workshopAddress,
        }),

        documents: application.documents,
        status: application.status,

        ...(application.submittedAt !== undefined && {
            submittedAt: application.submittedAt,
        }),

        ...(application.reviewedBy !== undefined && {
            reviewedBy: new Types.ObjectId(application.reviewedBy),
        }),

        ...(application.reviewedAt !== undefined && {
            reviewedAt: application.reviewedAt,
        }),

        ...(application.reviewReason !== undefined && {
            reviewReason: application.reviewReason,
        }),
    };
}

    static toDomain(
        document: IMechanicApplicationDocument
    ): MechanicApplication {

        const props: MechanicApplicationProps = {
            id: document._id.toString(),
            userId: document.userId.toString(),

            profilePhotoKey: document.profilePhotoKey ?? "",
            experienceYears: document.experienceYears ?? 0,

            specialization: document.specialization ?? [],
            supportedVehicleTypes: document.supportedVehicleTypes ?? [],
            serviceOffered: document.serviceOffered ?? [],

            serviceModel: document.serviceModel ?? "workshop",
            serviceAddress: document.serviceAddress ?? "",

            documents: document.documents ?? [],
            status: document.status,

            ...(document.professionalDescription !== undefined && {
                professionalDescription: document.professionalDescription,
            }),

            ...(document.latitude !== undefined && {
                latitude: document.latitude,
            }),

            ...(document.longitude !== undefined && {
                longitude: document.longitude,
            }),

            ...(document.serviceRadiusKm !== undefined && {
                serviceRadiusKm: document.serviceRadiusKm,
            }),

            ...(document.workshopName !== undefined && {
                workshopName: document.workshopName,
            }),

            ...(document.workshopAddress !== undefined && {
                workshopAddress: document.workshopAddress,
            }),

            ...(document.submittedAt !== undefined && {
                submittedAt: document.submittedAt,
            }),

            ...(document.reviewedBy != null && {
                reviewedBy: document.reviewedBy.toString(),
            }),

            ...(document.reviewedAt !== undefined && {
                reviewedAt: document.reviewedAt,
            }),

            ...(document.reviewReason !== undefined && {
                reviewReason: document.reviewReason,
            }),

            ...(document.createdAt !== undefined && {
                createdAt: document.createdAt,
            }),

            ...(document.updatedAt !== undefined && {
                updatedAt: document.updatedAt,
            }),
        };

        return new MechanicApplication(props);
    }
}
