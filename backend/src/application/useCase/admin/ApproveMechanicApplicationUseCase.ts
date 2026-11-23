
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { IApproveMechanicApplicationUseCase } from "../../interfaces/IApproveMechanicApplicationUseCase.js";
import { ITransactionManager } from "../../../infrastructure/databases/interface/IMongoTransactionManger.js";

export class ApproveMechanicApplicationUseCase
    implements IApproveMechanicApplicationUseCase {

    constructor(
        private readonly applicationRepository: IMechanicApplicationRepository,
        private readonly userRepository: IUserRepository,
        private readonly transactionManger: ITransactionManager
    ) { }

    async execute(
        applicationId: string,
        adminId: string
    ): Promise<MechanicApplication> {

        const application =
            await this.applicationRepository.findById(applicationId);

        if (!application) {
            throw new BadRequest(
                "Mechanic application not found",
                "APPLICATION_NOT_FOUND"
            );
        }

        if (!application.id) {
            throw new BadRequest(
                "Application ID is missing",
                "APPLICATION_ID_MISSING"
            );
        }

        if (
            application.status !== "pending" &&
            application.status !== "under_review"
        ) {
            throw new ConflictError(
                "This application cannot be approved in its current status",
                "APPLICATION_NOT_REVIEWABLE"
            );
        }

        const user = await this.userRepository.findById(application.userId);

        if (!user) {
            throw new BadRequest(
                "Applicant account not found",
                "APPLICANT_NOT_FOUND"
            );
        }

        if (user.status !== "active") {
            throw new ConflictError(
                "A blocked user cannot be approved as a mechanic",
                "APPLICANT_ACCOUNT_BLOCKED"
            );
        }


        const specializations = application.specializations;

        const hasSpecialization = specializations.some(category => category.subcategories.length > 0)

        if (!hasSpecialization) {
            throw new ConflictError("No specification are available for approval.", "NO_SPECIFICATIONS")
        }

        const hasPendingSpecialization = specializations.some(
            category =>
                category.subcategories.some(
                    sub => sub.verificationStatus === "pending"
                )
        );

        const hasApprovedSpecialization = specializations.some(
            category =>
                category.subcategories.some(
                    sub => sub.verificationStatus === "approved"
                )
        );

        if (hasPendingSpecialization) {
            throw new ConflictError(
                "Please review all selected specializations before approving the application",
                "SPECIALIZATION_REVIEW_PENDING"
            );
        }

        if (!hasApprovedSpecialization) {
            throw new ConflictError(
                "At least one specialization must be approved",
                "NO_APPROVED_SPECIALIZATION"
            );
        }

        const reviewedAt = new Date();

        const reviewedApplication = new MechanicApplication({
            id: application.id,
            userId: application.userId,

            status: "approved",
            reviewedBy: adminId,
            reviewedAt,

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

        const updatedApplication = await this.transactionManger.execute(
            async (transaction) => {

                const updatedApplication =
                    await this.applicationRepository.update(
                        application.id!,
                        reviewedApplication,
                        undefined,
                        transaction
                    );

                if (!updatedApplication) {
                    throw new BadRequest("Failed to approve application");
                }

                const updatedUser = await this.userRepository.addRole(
                    application.userId,
                    "mechanic",
                    transaction
                );

                if (!updatedUser) {
                    throw new BadRequest("Failed to update user role");
                }

                return updatedApplication;
            }
        );

        return updatedApplication;
    }
}