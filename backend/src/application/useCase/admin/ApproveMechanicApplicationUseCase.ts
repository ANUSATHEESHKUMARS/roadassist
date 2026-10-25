import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/mechanic/IMechanicApplicationRepository.js";
import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { IApproveMechanicApplicationUseCase } from "../../interfaces/IApproveMechanicApplicationUseCase.js";

export class ApproveMechanicApplicationUseCase implements IApproveMechanicApplicationUseCase {
    constructor(private readonly applicationRepository: IMechanicApplicationRepository,
        private readonly userRepository: IUserRepository
    ) { }

    async execute(appliationId: string, adminId: string): Promise<MechanicApplication> {
        const application = await this.applicationRepository.findById(appliationId)
        if (!application) {
            throw new BadRequest('Mechanic application not found', "APPLICATION_NOT_FOUND")
        }
        if (application.status !== "pending" && application.status !== "under_review") {
            throw new ConflictError("This application cannot be approved in its current status", 'APPLICAION_NOT_REVIEWABLE')
        }
        const user = await this.userRepository.findById(application.userId)

        if (!user) {
            throw new BadRequest("Applicant account not found", "APPLICANT_NOT_FOUND")
        }
        if (user.status !== "active") {
            throw new ConflictError("A blocked user cannot be approved as a mechanic", "APPLICANT_ACCOUND_BLOCKED")
        }
        if (!application.id) {
            throw new BadRequest("Application Id is missing", 'APPLICAITON ID IS MISSING')
        }
        const reviewedAt = new Date()

        const reviewedApplication = new MechanicApplication({
            id: application.id,
            userId: application.userId,
            status: "approved",
            reviewedBy: adminId,
            reviewedAt,
            documents: application.documents,
            specialization: application.specializations,
            supportedVehicleTypes: application.supportedVehicleType,
            serviceOffered: application.serviceOffered,

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

        const updatedApplicaiton = await this.applicationRepository.update(application.id,
            reviewedApplication
        );

        if (!updatedApplicaiton) {
            throw new BadRequest('Failed to approve mechanic application', "FAILED_TO_APPROVE_APPLICAITON")
        }
        const updatedUser = await this.userRepository.updateRole(application.userId, "mechanic")
        if (!updatedUser) {

            throw new BadRequest(
                "Application approved, but mechanic role update failed. Administrator intervention is required.",
                "MECHANIC_ROLE_UPDATE_FAILED"
            );
        }

        return updatedApplicaiton;
    }
}
