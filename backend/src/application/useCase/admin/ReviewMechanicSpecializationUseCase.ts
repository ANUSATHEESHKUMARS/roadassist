import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";

import {
    MechanicApplication
} from "../../../domain/User/entities/MechanicApplication.js";

import {
    BadRequest
} from "../../../shared/errors/BadRequestError.js";

import {
    ConflictError
} from "../../../shared/errors/ConflitError.js";

import { ReviewMechanicSpecializationDto } from "../../dtos/admin/RevierwMechanicSpecialization.js";
import { IReviewMechanicSpecializationUseCase } from "../../interfaces/admin/IReviewMechanicSpecializationUseCase.js";
export class ReviewMechanicSpecializationUseCase implements IReviewMechanicSpecializationUseCase {

    constructor(
        private readonly applicationRepository: IMechanicApplicationRepository
    ) { }


    async execute(
        applicationId: string,
        categoryId: string,
        subcategoryId: string,
        adminId: string,
        dto: ReviewMechanicSpecializationDto
    ): Promise<MechanicApplication> {

        // 1. Validate decision

        if (
            dto.decision !== "approved" &&
            dto.decision !== "rejected"
        ) {
            throw new BadRequest(
                "Invalid specialization review decision",
                "INVALID_REVIEW_DECISION"
            );
        }


        // 2. Validate rejection reason

        const rejectionReason = dto.rejectionReason?.trim();

        if (
            dto.decision === "rejected" &&
            !rejectionReason
        ) {
            throw new BadRequest(
                "Rejection reason is required",
                "REJECTION_REASON_REQUIRED"
            );
        }


        // 3. Find application

        const application =
            await this.applicationRepository.findById(applicationId);

        if (!application) {
            throw new BadRequest(
                "Mechanic application not found",
                "APPLICATION_NOT_FOUND"
            );
        }


        // 4. Check application ID

        if (!application.id) {
            throw new BadRequest(
                "Application ID is missing",
                "APPLICATION_ID_MISSING"
            );
        }


        // 5. Check application status

        if (
            application.status !== "pending" &&
            application.status !== "under_review"
        ) {
            throw new ConflictError(
                "This application cannot be reviewed",
                "APPLICATION_NOT_REVIEWABLE"
            );
        }


        // 6. Find selected category

        const selectedCategory = application.specializations.find(
            category => category.categoryId === categoryId
        );

        if (!selectedCategory) {
            throw new BadRequest(
                "Selected category does not belong to this application",
                "CATEGORY_NOT_FOUND_IN_APPLICATION"
            );
        }


        // 7. Find selected subcategory

        const selectedSubcategory =
            selectedCategory.subcategories.find(
                subcategory =>
                    subcategory.subcategoryId === subcategoryId
            );

        if (!selectedSubcategory) {
            throw new BadRequest(
                "Selected subcategory does not belong to this category",
                "SUBCATEGORY_NOT_FOUND"
            );
        }


        // 8. Check whether it was already reviewed

        if (selectedSubcategory.verificationStatus !== "pending") {
            throw new ConflictError(
                "This specialization has already been reviewed",
                "SPECIALIZATION_ALREADY_REVIEWED"
            );
        }


        // 9. Create review information

        const reviewedAt = new Date();

        const reviewHistory = [
            ...(selectedSubcategory.reviewHistory ?? []),
            {
                decision: dto.decision,
                reviewedBy: adminId,
                reviewedAt,
                ...(dto.decision === "rejected" && {
                    rejectionReason: rejectionReason!
                })
            }
        ];


        // 10. Update selected specialization

        const updatedSpecializations = application.specializations.map(
            category => {

                if (category.categoryId !== categoryId) {
                    return category;
                }

                return {
                    ...category,

                    subcategories: category.subcategories.map(subcategory => {

                        if (subcategory.subcategoryId !== subcategoryId) {
                            return subcategory;
                        }

                        return {
                            subcategoryId: subcategory.subcategoryId,

                            verificationStatus: dto.decision,

                            reviewedBy: adminId,

                            reviewedAt,

                            ...(dto.decision === "rejected" && {
                                rejectionReason: rejectionReason!
                            }),

                            reviewHistory
                        };
                    })
                };
            }
        );


        // 11. Construct updated application

        const updatedApplication = new MechanicApplication({

            id: application.id,

            userId: application.userId,

            status: application.status,

            specializations: updatedSpecializations,

            supportedVehicleTypes: application.supportedVehicleTypes,

            serviceOffered: application.serviceOffered,

            documents: application.documents,

            ...(application.profilePhotoKey !== undefined && {
                profilePhotoKey: application.profilePhotoKey
            }),

            ...(application.experienceYears !== undefined && {
                experienceYears: application.experienceYears
            }),

            ...(application.professionalDescription !== undefined && {
                professionalDescription: application.professionalDescription
            }),

            ...(application.serviceModel !== undefined && {
                serviceModel: application.serviceModel
            }),

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

            ...(application.submittedAt !== undefined && {
                submittedAt: application.submittedAt
            }),

            ...(application.reviewedBy !== undefined && {
                reviewedBy: application.reviewedBy
            }),

            ...(application.reviewedAt !== undefined && {
                reviewedAt: application.reviewedAt
            }),

            ...(application.reviewReason !== undefined && {
                reviewReason: application.reviewReason
            }),

            ...(application.createdAt !== undefined && {
                createdAt: application.createdAt
            }),

            updatedAt: new Date()
        });


        // 12. Save updated application

        const savedApplication =
            await this.applicationRepository.update(
                application.id,
                updatedApplication
            );

        if (!savedApplication) {
            throw new BadRequest(
                "Failed to update specialization review",
                "SPECIALIZATION_REVIEW_FAILED"
            );
        }

        return savedApplication;
    }
}