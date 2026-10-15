
import { IMechanicApplicationRepository } from "../../../domain/repositories/mechanic/IMechanicApplicationRepository.js";
import {
    MechanicApplication,
    MechanicServiceModel,
} from "../../../domain/User/entities/MechanicApplication.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ISubmitMechanicApplicationUseCase } from "../../interfaces/mechanic/ISubmitMechanicApplicationUseCase.js";
import { MechanicApplicationValidator } from "../../validators/MechanicApplicationValidaor.js";
import { SubmitMechanicApplicationDto } from "../../dtos/mechanic/SubmitMechanicApplicationDto.js";

export class SubmitMechanicApplicationUseCase
    implements ISubmitMechanicApplicationUseCase {

    constructor(
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository,
        private readonly mechanicApplicationValidator: MechanicApplicationValidator
    ) { }

    async execute(userId: string): Promise<MechanicApplication> {

        const application =
            await this.mechanicApplicationRepository.findByUserId(userId);

        if (!application) {
            throw new BadRequest(
                "Mechanic application not found. Save a draft first.",
                "APPLICATION_NOT_FOUND"
            );
        }

        if (!application.id) {
            throw new BadRequest(
                "Mechanic application ID is missing.",
                "APPLICATION_ID_MISSING"
            );
        }

        if (
            application.status !== "incomplete" &&
            application.status !== "changes_requested"
        ) {
            throw new ConflictError(
                "This application cannot be submitted in its current status.",
                "APPLICATION_NOT_SUBMITTABLE"
            );
        }

        const serviceModel = application.serviceModel;

        if (!serviceModel) {
            throw new BadRequest(
                "Service model is required.",
                "SERVICE_MODEL_REQUIRED"
            );
        }

        const dto: SubmitMechanicApplicationDto = {
            profilePhotoKey: application.profilePhotoKey ?? "",
            experienceYears: application.experienceYears ?? -1,
            specialization: application.specializations,
            supportedVehicleTypes: application.supportedVehicleType,
            serviceOffered: application.serviceOffered,
            serviceModel: serviceModel as MechanicServiceModel,
            serviceAddress: application.serviceAddress ?? "",
            documents: application.documents,

            ...(application.professionalDescription !== undefined
                ? {
                    professionalDescription:
                        application.professionalDescription
                }
                : {}),

            ...(application.latitude !== undefined
                ? { latitude: application.latitude }
                : {}),

            ...(application.longitude !== undefined
                ? { longitude: application.longitude }
                : {}),

            ...(application.serviceRadiusKm !== undefined
                ? { serviceRadiusKm: application.serviceRadiusKm }
                : {}),

            ...(application.workshopName !== undefined
                ? { workshopName: application.workshopName }
                : {}),

            ...(application.workshopAddress !== undefined
                ? { workshopAddress: application.workshopAddress }
                : {}),
        };

        this.mechanicApplicationValidator.validateSubmission(dto);


        const submittedApplication = new MechanicApplication({
            id: application.id,
            userId: application.userId,

            ...(application.profilePhotoKey !== undefined
                ? { profilePhotoKey: application.profilePhotoKey }
                : {}),

            ...(application.experienceYears !== undefined
                ? { experienceYears: application.experienceYears }
                : {}),

            specialization: application.specializations,
            supportedVehicleTypes: application.supportedVehicleType,
            serviceOffered: application.serviceOffered,

            ...(application.professionalDescription !== undefined
                ? { professionalDescription: application.professionalDescription }
                : {}),

            ...(application.serviceModel !== undefined
                ? { serviceModel: application.serviceModel }
                : {}),

            ...(application.serviceAddress !== undefined
                ? { serviceAddress: application.serviceAddress }
                : {}),

            ...(application.latitude !== undefined
                ? { latitude: application.latitude }
                : {}),

            ...(application.longitude !== undefined
                ? { longitude: application.longitude }
                : {}),

            ...(application.serviceRadiusKm !== undefined
                ? { serviceRadiusKm: application.serviceRadiusKm }
                : {}),

            ...(application.workshopName !== undefined
                ? { workshopName: application.workshopName }
                : {}),

            ...(application.workshopAddress !== undefined
                ? { workshopAddress: application.workshopAddress }
                : {}),

            documents: application.documents,
            status: "pending",
            submittedAt: new Date(),

            ...(application.createdAt !== undefined
                ? { createdAt: application.createdAt }
                : {}),

            updatedAt: new Date()
        });



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
