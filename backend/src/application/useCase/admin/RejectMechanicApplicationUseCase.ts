
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { IRejectMechanicApplictionUseCase } from "../../interfaces/IRejectMechanicApplicaitonUseCase.js";

export class RejectMechanicApplicationUseCase
    implements IRejectMechanicApplictionUseCase {

    constructor(
        private readonly applicationRepository: IMechanicApplicationRepository
    ) {}

    async execute(
        applicationId: string,
        adminId: string,
        rejectionReason: string
    ): Promise<MechanicApplication> {

        // 1. Validate rejection reason
        const normalizedReason = rejectionReason.trim();

        if (!normalizedReason) {
            throw new BadRequest(
                "A rejection reason is required.",
                "REJECTION_REASON_REQUIRED"
            );
        }

        // 2. Find application
        const application =
            await this.applicationRepository.findById(applicationId);

        if (!application) {
            throw new BadRequest(
                "Mechanic application not found.",
                "APPLICATION_NOT_FOUND"
            );
        }

        // 3. Check application status
        if (
            application.status !== "pending" &&
            application.status !== "under_review"
        ) {
            throw new ConflictError(
                "This application cannot be rejected in its current status.",
                "APPLICATION_NOT_REVIEWABLE"
            );
        }

        if (!application.id) {
            throw new BadRequest(
                "Application ID is missing.",
                "APPLICATION_ID_MISSING"
            );
        }

        // 4. Create rejected application
        const rejectedApplication = new MechanicApplication({
            id: application.id,
            userId: application.userId,

            status: "rejected",
            reviewedBy: adminId,
            reviewedAt: new Date(),
            reviewReason: normalizedReason,

            // Updated specialization structure
            specializations: application.specializations,
            supportedVehicleTypes: application.supportedVehicleTypes,

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

            ...(application.serviceRadiusKm !== undefined && {
                serviceRadiusKm: application.serviceRadiusKm
            }),

            ...(application.workshopName !== undefined && {
                workshopName: application.workshopName
            }),

            ...(application.workshopAddress !== undefined && {
                workshopAddress: application.workshopAddress
            }),

            ...(application.submittedAt !== undefined && {
                submittedAt: application.submittedAt
            }),

            ...(application.createdAt !== undefined && {
                createdAt: application.createdAt
            })
        });

        const result = await this.applicationRepository.update(
            application.id,
            rejectedApplication
        );

        if (!result) {
            throw new BadRequest(
                "Failed to reject mechanic application.",
                "APPLICATION_REJECTION_FAILED"
            );
        }

        return result;
    }
}
