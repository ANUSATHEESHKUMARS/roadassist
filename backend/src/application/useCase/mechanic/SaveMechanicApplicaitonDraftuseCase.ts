import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import {
    MechanicApplication,
    MechanicApplicationProps,
    MechanicSpecialization,
    MechanicSubSpecialization
} from "../../../domain/User/entities/MechanicApplication.js";

import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";

import {
    SaveMechanicApplicationDraftDto
} from "../../dtos/mechanic/SavemechanicApplicationDraftDto.js";

import {
    ISaveMechanicApplicationDraftUseCase
} from "../../interfaces/mechanic/ISaveMechanicApplicationDraftUseCase.js";

import {
    MechanicApplicationValidator
} from "../../validators/MechanicApplicationValidaor.js";
import { IMechanicSpecializationValidator } from "../../validators/interfaces/IMechanicSpecializationValidator.js";


export class SaveMechanicDraftUseCase
    implements ISaveMechanicApplicationDraftUseCase {

    constructor(
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository,
        private readonly mechanicApplicationValidator: MechanicApplicationValidator,
        private readonly mechanicSpecializationValidator: IMechanicSpecializationValidator
        
    ) { }


    async execute(
        userId: string,
        dto: SaveMechanicApplicationDraftDto
    ): Promise<MechanicApplication> {


        this.mechanicApplicationValidator.validateDraft(dto);

        await this.mechanicSpecializationValidator.validate(dto.specializations)
        
        const existingApplication =
            await this.mechanicApplicationRepository.findByUserId(userId);



        if (!existingApplication) {

            const specializations: MechanicSpecialization[] =
                (dto.specializations ?? []).map(specialization => ({
                    categoryId: specialization.categoryId,

                    subcategories: specialization.subcategoryIds.map(
                        subcategoryId => ({
                            subcategoryId,
                            verificationStatus: "pending"
                        })
                    )
                }));


            const application = new MechanicApplication({

                userId,

                status: "incomplete",

                specializations,

                supportedVehicleTypes: dto.supportedVehicleTypes ?? [],

                documents: dto.documents ?? [],

                ...(dto.profilePhotoKey !== undefined && {
                    profilePhotoKey: dto.profilePhotoKey
                }),

                ...(dto.experienceYears !== undefined && {
                    experienceYears: dto.experienceYears
                }),

                ...(dto.professionalDescription !== undefined && {
                    professionalDescription: dto.professionalDescription
                }),

                ...(dto.serviceModel !== undefined && {
                    serviceModel: dto.serviceModel
                }),

                ...(dto.serviceAddress !== undefined && {
                    serviceAddress: dto.serviceAddress
                }),

                ...(dto.pincode !== undefined && {
                    pincode: dto.pincode
                }),

                ...(dto.latitude !== undefined && {
                    latitude: dto.latitude
                }),

                ...(dto.longitude !== undefined && {
                    longitude: dto.longitude
                }),

                ...(dto.serviceRadiusKm !== undefined && {
                    serviceRadiusKm: dto.serviceRadiusKm
                }),

                ...(dto.workshopName !== undefined && {
                    workshopName: dto.workshopName
                }),

                ...(dto.workshopAddress !== undefined && {
                    workshopAddress: dto.workshopAddress
                })
            });


            return this.mechanicApplicationRepository.create(application);
        }


        // 4. Check whether existing application is editable

        if (
            existingApplication.status !== "incomplete" &&
            existingApplication.status !== "changes_requested"
        ) {
            throw new ConflictError(
                "This application cannot be edited in its current status.",
                "APPLICATION_NOT_EDITABLE"
            );
        }


        // 5. Validate existing application ID

        if (!existingApplication.id) {
            throw new BadRequest(
                "The existing application has no ID.",
                "APPLICATION_ID_MISSING"
            );
        }



        const specializations = dto.specializations !== undefined
            ? this.mergeSpecializations(
                dto.specializations,
                existingApplication.specializations
            )
            : existingApplication.specializations;



        const updatedProps: MechanicApplicationProps = {

            id: existingApplication.id,

            userId: existingApplication.userId,

            status: existingApplication.status,

            specializations,

            supportedVehicleTypes:
                dto.supportedVehicleTypes ??
                existingApplication.supportedVehicleTypes,

            documents:
                dto.documents ??
                existingApplication.documents,

            ...(existingApplication.profilePhotoKey !== undefined && {
                profilePhotoKey: existingApplication.profilePhotoKey
            }),

            ...(dto.profilePhotoKey !== undefined && {
                profilePhotoKey: dto.profilePhotoKey
            }),

            ...(dto.experienceYears !== undefined
                ? { experienceYears: dto.experienceYears }
                : existingApplication.experienceYears !== undefined
                    ? { experienceYears: existingApplication.experienceYears }
                    : {}),

            ...(dto.professionalDescription !== undefined
                ? { professionalDescription: dto.professionalDescription }
                : existingApplication.professionalDescription !== undefined
                    ? { professionalDescription: existingApplication.professionalDescription }
                    : {}),

            ...(dto.serviceModel !== undefined
                ? { serviceModel: dto.serviceModel }
                : existingApplication.serviceModel !== undefined
                    ? { serviceModel: existingApplication.serviceModel }
                    : {}),

            ...(dto.serviceAddress !== undefined
                ? { serviceAddress: dto.serviceAddress }
                : existingApplication.serviceAddress !== undefined
                    ? { serviceAddress: existingApplication.serviceAddress }
                    : {}),

            ...(dto.pincode !== undefined
                ? { pincode: dto.pincode }
                : existingApplication.pincode !== undefined
                    ? { pincode: existingApplication.pincode }
                    : {}),

            ...(dto.latitude !== undefined
                ? { latitude: dto.latitude }
                : existingApplication.latitude !== undefined
                    ? { latitude: existingApplication.latitude }
                    : {}),

            ...(dto.longitude !== undefined
                ? { longitude: dto.longitude }
                : existingApplication.longitude !== undefined
                    ? { longitude: existingApplication.longitude }
                    : {}),

            ...(dto.serviceRadiusKm !== undefined
                ? { serviceRadiusKm: dto.serviceRadiusKm }
                : existingApplication.serviceRadiusKm !== undefined
                    ? { serviceRadiusKm: existingApplication.serviceRadiusKm }
                    : {}),

            ...(dto.workshopName !== undefined
                ? { workshopName: dto.workshopName }
                : existingApplication.workshopName !== undefined
                    ? { workshopName: existingApplication.workshopName }
                    : {}),

            ...(dto.workshopAddress !== undefined
                ? { workshopAddress: dto.workshopAddress }
                : existingApplication.workshopAddress !== undefined
                    ? { workshopAddress: existingApplication.workshopAddress }
                    : {}),

            ...(existingApplication.submittedAt !== undefined && {
                submittedAt: existingApplication.submittedAt
            }),

            ...(existingApplication.reviewedBy !== undefined && {
                reviewedBy: existingApplication.reviewedBy
            }),

            ...(existingApplication.reviewedAt !== undefined && {
                reviewedAt: existingApplication.reviewedAt
            }),

            ...(existingApplication.reviewReason !== undefined && {
                reviewReason: existingApplication.reviewReason
            }),

            ...(existingApplication.createdAt !== undefined && {
                createdAt: existingApplication.createdAt
            }),

            updatedAt: new Date()
        };



        const updatedApplication =
            new MechanicApplication(updatedProps);



        const savedApplication =
            await this.mechanicApplicationRepository.update(
                existingApplication.id,
                updatedApplication
            );


        if (!savedApplication) {
            throw new BadRequest(
                "Unable to save mechanic application draft.",
                "DRAFT_SAVE_FAILED"
            );
        }


        return savedApplication;
    }



    private mergeSpecializations(
        selections: NonNullable<SaveMechanicApplicationDraftDto["specializations"]>,
        existingSpecializations: MechanicSpecialization[]
    ): MechanicSpecialization[] {

        return selections.map(selection => {

            const existingCategory = existingSpecializations.find(
                item => item.categoryId === selection.categoryId
            );

            const subcategories: MechanicSubSpecialization[] =
                selection.subcategoryIds.map(subcategoryId => {

                    const existingSubcategory =
                        existingCategory?.subcategories.find(
                            item => item.subcategoryId === subcategoryId
                        );

                    if (existingSubcategory) {
                        return existingSubcategory;
                    }

                    return {
                        subcategoryId,
                        verificationStatus: "pending"
                    };
                });

            return {
                categoryId: selection.categoryId,
                subcategories
            };
        });
    }
}
