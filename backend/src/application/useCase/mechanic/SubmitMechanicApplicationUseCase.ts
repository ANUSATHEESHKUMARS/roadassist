
import { IMechanicApplicationRepository }
    from "../../../domain/repositories/IMechanicApplicationRepository.js";

import {
    MechanicApplication
} from "../../../domain/User/entities/MechanicApplication.js";

import { ConflictError }
    from "../../../shared/errors/ConflitError.js";

import { BadRequest }
    from "../../../shared/errors/BadRequestError.js";

import { ISubmitMechanicApplicationUseCase }
    from "../../interfaces/mechanic/ISubmitMechanicApplicationUseCase.js";
import { IMechanicSpecializationValidator } from "../../validators/interfaces/IMechanicSpecializationValidator.js";

import { MechanicApplicationValidator }
    from "../../validators/MechanicApplicationValidaor.js";

import { SubmitMechanicApplicationDto }
    from "../../dtos/mechanic/SubmitMechanicApplicationDto.js";


export class SubmitMechanicApplicationUseCase
    implements ISubmitMechanicApplicationUseCase {

    constructor(
        private readonly mechanicApplicationRepository:
            IMechanicApplicationRepository,

        private readonly mechanicApplicationValidator:
            MechanicApplicationValidator,

        private readonly mechanicSpecializationValidator:
            IMechanicSpecializationValidator
    ) { }


    async execute(userId: string): Promise<MechanicApplication> {

        // 1. Find the mechanic's saved application

        const application =
            await this.mechanicApplicationRepository.findByUserId(userId);

        if (!application) {
            throw new BadRequest(
                "Mechanic application not found. Save a draft first.",
                "APPLICATION_NOT_FOUND"
            );
        }


        // 2. Validate application ID

        if (!application.id) {
            throw new BadRequest(
                "Mechanic application ID is missing.",
                "APPLICATION_ID_MISSING"
            );
        }


        // 3. Check whether the application can be submitted

        if (
            application.status !== "incomplete" &&
            application.status !== "changes_requested"
        ) {
            throw new ConflictError(
                "This application cannot be submitted in its current status.",
                "APPLICATION_NOT_SUBMITTABLE"
            );
        }


        // 4. Validate required service information

        if (!application.serviceModel) {
            throw new BadRequest(
                "Service model is required.",
                "SERVICE_MODEL_REQUIRED"
            );
        }


        // 5. Convert domain specializations into selection DTOs

        const specializationSelections =
            application.specializations.map(specialization => ({
                categoryId: specialization.categoryId,

                subcategoryIds: specialization.subcategories.map(
                    subcategory => subcategory.subcategoryId
                )
            }));


        // 6. Validate selected categories and subcategories
        // Database-backed validation is handled by the validator.

        await this.mechanicSpecializationValidator.validate(
            specializationSelections
        );


        // 7. Prepare submission DTO for application validation

        const dto: SubmitMechanicApplicationDto = {

            profilePhotoKey: application.profilePhotoKey ?? "",

            experienceYears: application.experienceYears ?? -1,

            specializations: specializationSelections,

            supportedVehicleTypes: application.supportedVehicleTypes,

            serviceOffered: application.serviceOffered,

            serviceModel: application.serviceModel,

            serviceAddress: application.serviceAddress ?? "",

            documents: application.documents.map(document => ({
                documentType: document.documentType,
                fileKey: document.fileKey,
                originalName: document.originalName,
                mimeType: document.mimeType,
                verificationStatus: document.verificationStatus,

                ...(document.rejectionReason !== undefined && {
                    rejectionReason: document.rejectionReason
                })
            })),

            ...(application.pincode !== undefined && {
                pincode: application.pincode
            }),

            ...(application.professionalDescription !== undefined && {
                professionalDescription: application.professionalDescription
            }),

            ...(application.latitude !== undefined && {
                latitude: application.latitude
            }),

            ...(application.longitude !== undefined && {
                longitude: application.longitude
            }),

            ...(application.locationSource !== undefined && {
                locationSource: application.locationSource
            }),

            ...(application.serviceRadiusKm !== undefined && {
                serviceRadiusKm: application.serviceRadiusKm
            }),

            ...(application.workshopName !== undefined && {
                workshopName: application.workshopName
            }),

            ...(application.workshopAddress !== undefined && {
                workshopAddress: application.workshopAddress
            }),

            ...(application.workshopLatitude !== undefined && {
                workshopLatitude: application.workshopLatitude
            }),

            ...(application.workshopLongitude !== undefined && {
                workshopLongitude: application.workshopLongitude
            }),

            ...(application.workshopLocationSource !== undefined && {
                workshopLocationSource: application.workshopLocationSource
            })
        };


        // 8. Validate all required submission fields

        this.mechanicApplicationValidator.validateSubmission(dto);


        // 9. Construct submitted application
        // Preserve existing specialization verification statuses.

        const submittedApplication = new MechanicApplication({

            id: application.id,

            userId: application.userId,

            ...(application.profilePhotoKey !== undefined && {
                profilePhotoKey: application.profilePhotoKey
            }),

            ...(application.experienceYears !== undefined && {
                experienceYears: application.experienceYears
            }),

            specializations: application.specializations,

            supportedVehicleTypes: application.supportedVehicleTypes,

            serviceOffered: application.serviceOffered,

            ...(application.professionalDescription !== undefined && {
                professionalDescription: application.professionalDescription
            }),

            serviceModel: application.serviceModel,

            ...(application.serviceAddress !== undefined && {
                serviceAddress: application.serviceAddress
            }),

            ...(application.pincode !== undefined && {
                pincode: application.pincode
            }),

            ...(application.latitude !== undefined && {
                latitude: application.latitude
            }),

            ...(application.longitude !== undefined && {
                longitude: application.longitude
            }),

            ...(application.locationSource !== undefined && {
                locationSource: application.locationSource
            }),

            ...(application.serviceRadiusKm !== undefined && {
                serviceRadiusKm: application.serviceRadiusKm
            }),

            ...(application.workshopName !== undefined && {
                workshopName: application.workshopName
            }),

            ...(application.workshopAddress !== undefined && {
                workshopAddress: application.workshopAddress
            }),

            ...(application.workshopLatitude !== undefined && {
                workshopLatitude: application.workshopLatitude
            }),

            ...(application.workshopLongitude !== undefined && {
                workshopLongitude: application.workshopLongitude
            }),

            ...(application.workshopLocationSource !== undefined && {
                workshopLocationSource: application.workshopLocationSource
            }),

            documents: application.documents,

            status: "pending",

            submittedAt: new Date(),

            ...(application.createdAt !== undefined && {
                createdAt: application.createdAt
            }),

            updatedAt: new Date()
        });


        // 10. Save submitted application

        const savedApplication =
            await this.mechanicApplicationRepository.update(
                application.id,
                submittedApplication
            );

        if (!savedApplication) {
            throw new BadRequest(
                "Failed to submit mechanic application.",
                "APPLICATION_SUBMISSION_FAILED"
            );
        }


        return savedApplication;
    }
}
