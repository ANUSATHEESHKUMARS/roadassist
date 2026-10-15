
import { IMechanicApplicationRepository } from "../../../domain/repositories/mechanic/IMechanicApplicationRepository.js";
import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { SaveMechanicApplicationDraftDto } from "../../dtos/mechanic/SavemechanicApplicationDraftDto.js";
import { ISaveMechanicApplicationDraftUseCase } from "../../interfaces/mechanic/ISaveMechanicApplicationDraftUseCase.js";
import { MechanicApplicationValidator } from "../../validators/MechanicApplicationValidaor.js";

export class SaveMechanicDraftUseCase
    implements ISaveMechanicApplicationDraftUseCase {

    constructor(
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository,
        private readonly mechanicApplicationValidator: MechanicApplicationValidator
    ) {}

    async execute(
        userId: string,
        dto: SaveMechanicApplicationDraftDto
    ): Promise<MechanicApplication> {

        this.mechanicApplicationValidator.validateDraft(dto);

        const existingApplication =
            await this.mechanicApplicationRepository.findByUserId(userId);

        if (!existingApplication) {
            const application = new MechanicApplication({
                userId,
                ...dto,
                status: "incomplete",
            });

            return this.mechanicApplicationRepository.create(application);
        }

        if (
            existingApplication.status !== "incomplete" &&
            existingApplication.status !== "changes_requested"
        ) {
            throw new ConflictError(
                "This application cannot be edited in its current status",
                "APPLICATION_NOT_EDITABLE"
            );
        }

        const updatedProps = {
            userId: existingApplication.userId,
            status: existingApplication.status,

            ...(existingApplication.id !== undefined
                ? { id: existingApplication.id }
                : {}),

            ...omitUndefined({
                profilePhotoKey:
                    dto.profilePhotoKey ??
                    existingApplication.profilePhotoKey,

                experienceYears:
                    dto.experienceYears ??
                    existingApplication.experienceYears,

                specialization:
                    dto.specialization ??
                    existingApplication.specializations,

                supportedVehicleTypes:
                    dto.supportedVehicleTypes ??
                    existingApplication.supportedVehicleType,

                serviceOffered:
                    dto.serviceOffered ??
                    existingApplication.serviceOffered,

                professionalDescription:
                    dto.professionalDescription ??
                    existingApplication.professionalDescription,

                serviceModel:
                    dto.serviceModel ??
                    existingApplication.serviceModel,

                serviceAddress:
                    dto.serviceAddress ??
                    existingApplication.serviceAddress,

                latitude:
                    dto.latitude ?? existingApplication.latitude,

                longitude:
                    dto.longitude ?? existingApplication.longitude,

                serviceRadiusKm:
                    dto.serviceRadiusKm ??
                    existingApplication.serviceRadiusKm,

                workshopName:
                    dto.workshopName ??
                    existingApplication.workshopName,

                workshopAddress:
                    dto.workshopAddress ??
                    existingApplication.workshopAddress,

                documents:
                    dto.documents ?? existingApplication.documents,
            }),
        };

        const updatedApplication =
            new MechanicApplication(updatedProps);

        if (!existingApplication.id) {
            throw new BadRequest(
                "The existing application has no ID",
                "APPLICATION_ID_MISSING"
            );
        }

        const savedApplication =
            await this.mechanicApplicationRepository.update(
                existingApplication.id,
                updatedApplication
            );

        if (!savedApplication) {
            throw new BadRequest(
                "Unable to save mechanic application draft",
                "DRAFT_SAVE_FAILED"
            );
        }

        return savedApplication;
    }
}

type OptionalDefined<T> = {
    [K in keyof T]?: Exclude<T[K], undefined>;
};

function omitUndefined<T extends Record<string, unknown>>(
    obj: T
): OptionalDefined<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== undefined)
    ) as OptionalDefined<T>;
}
