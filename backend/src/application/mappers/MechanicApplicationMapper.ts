
import { Types } from "mongoose";

import {
    MechanicApplication,
    MechanicApplicationProps,
} from "../../domain/User/entities/MechanicApplication.js";

import type {
    IMechanicApplicationDocument
} from "../../infrastructure/databases/models/MechanicApplicationModel.js";


export class MechanicApplicationMapper {

    // Domain Entity -> MongoDB Persistence
    static toPersistence(application: MechanicApplication) {

        return {
            userId: new Types.ObjectId(application.userId),

            ...(application.profilePhotoKey !== undefined && {
                profilePhotoKey: application.profilePhotoKey,
            }),

            ...(application.experienceYears !== undefined && {
                experienceYears: application.experienceYears,
            }),

            specializations: application.specializations.map(
                specialization => ({
                    categoryId: new Types.ObjectId(
                        specialization.categoryId
                    ),

                    subcategories: specialization.subcategories.map(
                        subcategory => ({
                            subcategoryId: new Types.ObjectId(
                                subcategory.subcategoryId
                            ),

                            verificationStatus: subcategory.verificationStatus,

                            ...(subcategory.reviewedBy !== undefined && {
                                reviewedBy: new Types.ObjectId(
                                    subcategory.reviewedBy
                                ),
                            }),

                            ...(subcategory.reviewedAt !== undefined && {
                                reviewedAt: subcategory.reviewedAt,
                            }),

                            ...(subcategory.rejectionReason !== undefined && {
                                rejectionReason: subcategory.rejectionReason,
                            }),

                            reviewHistory: (subcategory.reviewHistory ?? []).map(
                                history => ({
                                    decision: history.decision,

                                    reviewedBy: new Types.ObjectId(
                                        history.reviewedBy
                                    ),

                                    reviewedAt: history.reviewedAt,

                                    ...(history.rejectionReason !== undefined && {
                                        rejectionReason: history.rejectionReason,
                                    }),
                                })
                            ),
                        })
                    ),
                })
            ),

            supportedVehicleTypes: application.supportedVehicleTypes,

            ...(application.professionalDescription !== undefined && {
                professionalDescription: application.professionalDescription,
            }),

            ...(application.serviceModel !== undefined && {
                serviceModel: application.serviceModel,
            }),

            ...(application.serviceAddress !== undefined && {
                serviceAddress: application.serviceAddress,
            }),

            ...(application.pincode !== undefined && {
                pincode: application.pincode,
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


    // MongoDB Document -> Domain Entity
    static toDomain(
        document: IMechanicApplicationDocument
    ): MechanicApplication {

        const props: MechanicApplicationProps = {

            id: document._id.toString(),

            userId: document.userId.toString(),

            specializations: (document.specializations ?? []).map(
                specialization => ({
                    categoryId: specialization.categoryId.toString(),

                    subcategories: specialization.subcategories.map(
                        subcategory => ({
                            subcategoryId: subcategory.subcategoryId.toString(),

                            verificationStatus: subcategory.verificationStatus,

                            ...(subcategory.reviewedBy != null && {
                                reviewedBy: subcategory.reviewedBy.toString(),
                            }),

                            ...(subcategory.reviewedAt !== undefined && {
                                reviewedAt: subcategory.reviewedAt,
                            }),

                            ...(subcategory.rejectionReason !== undefined && {
                                rejectionReason: subcategory.rejectionReason,
                            }),

                            ...(subcategory.reviewHistory !== undefined && {
                                reviewHistory: subcategory.reviewHistory.map(
                                    history => ({
                                        decision: history.decision,

                                        reviewedBy: history.reviewedBy.toString(),

                                        reviewedAt: history.reviewedAt,

                                        ...(history.rejectionReason !== undefined && {
                                            rejectionReason: history.rejectionReason,
                                        }),
                                    })
                                ),
                            }),
                        })
                    ),
                })
            ),

            supportedVehicleTypes: document.supportedVehicleTypes ?? [],

            documents: document.documents ?? [],

            status: document.status,

            ...(document.profilePhotoKey !== undefined && {
                profilePhotoKey: document.profilePhotoKey,
            }),

            ...(document.experienceYears !== undefined && {
                experienceYears: document.experienceYears,
            }),

            ...(document.professionalDescription !== undefined && {
                professionalDescription: document.professionalDescription,
            }),

            ...(document.serviceModel !== undefined && {
                serviceModel: document.serviceModel,
            }),

            ...(document.serviceAddress !== undefined && {
                serviceAddress: document.serviceAddress,
            }),

            ...(document.pincode !== undefined && {
                pincode: document.pincode,
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


    // Domain Entity -> API Response
    static toResponse(application: MechanicApplication) {

        return {
            id: application.id,

            userId: application.userId,

            profilePhotoKey: application.profilePhotoKey,

            experienceYears: application.experienceYears,

            specializations: application.specializations,

            supportedVehicleTypes: application.supportedVehicleTypes,

            professionalDescription: application.professionalDescription,

            serviceModel: application.serviceModel,

            serviceAddress: application.serviceAddress,

            pincode: application.pincode,

            latitude: application.latitude,

            longitude: application.longitude,

            serviceRadiusKm: application.serviceRadiusKm,

            workshopName: application.workshopName,

            workshopAddress: application.workshopAddress,

            documents: application.documents,

            status: application.status,

            submittedAt: application.submittedAt,

            reviewedBy: application.reviewedBy,

            reviewedAt: application.reviewedAt,

            reviewReason: application.reviewReason,

            createdAt: application.createdAt,

            updatedAt: application.updatedAt,
        };
    }
}
