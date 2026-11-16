
import {
    MechanicApplication,
    MechanicApplicationProps
} from "../../../domain/User/entities/MechanicApplication.js";

import { IMechanicApplicationRepository } from "../../../domain/repositories/mechanic/IMechanicApplicationRepository.js";

import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";

import { UpdateMechanicServiceLocationDto } from "../../dtos/mechanic/UpdateMechanicservicelocationDto.js";

import { IUpdateMechanicServiceLocationUseCase } from "../../../domain/repositories/mechanic/IUpdateMechanicServiceLoatonUseCase.js";


export class UpdateMechanicServiceLocationUseCase
    implements IUpdateMechanicServiceLocationUseCase {

    constructor(
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository
    ) {}

    async execute(
        userId: string,
        dto: UpdateMechanicServiceLocationDto
    ): Promise<MechanicApplication> {

        console.log("User ID received:", userId);


        // 1. Find mechanic application
        const application =
            await this.mechanicApplicationRepository.findByUserId(userId);

console.log("Mechanic application found:", application);

        if (!application) {
            throw new BadRequest(
                "Mechanic application not found",
                "APPLICATION_NOT_FOUND"
            );
        }

        // 2. Check application ID
        if (!application.id) {
            throw new BadRequest(
                "Application ID is missing",
                "APPLICATION_ID_MISSING"
            );
        }

        // 3. Only approved mechanics can update location
        if (application.status !== "approved") {
            throw new ConflictError(
                "Only approved mechanics can update their service location",
                "APPLICATION_NOT_APPROVED"
            );
        }

        // 4. Validate service model
        if (!["mobile", "workshop", "both"].includes(dto.serviceModel)) {
            throw new BadRequest(
                "Invalid service model",
                "INVALID_SERVICE_MODEL"
            );
        }

        const requiresMobileLocation =
            dto.serviceModel === "mobile" ||
            dto.serviceModel === "both";

        const requiresWorkshopLocation =
            dto.serviceModel === "workshop" ||
            dto.serviceModel === "both";


        // 5. Validate mobile location
        if (requiresMobileLocation) {

            if (!dto.serviceAddress?.trim()) {
                throw new BadRequest(
                    "Service address is required",
                    "SERVICE_ADDRESS_REQUIRED"
                );
            }

            if (
                dto.latitude === undefined ||
                dto.longitude === undefined
            ) {
                throw new BadRequest(
                    "Service coordinates are required",
                    "SERVICE_COORDINATES_REQUIRED"
                );
            }

            if (
                !Number.isFinite(dto.latitude) ||
                dto.latitude < -90 ||
                dto.latitude > 90 ||
                !Number.isFinite(dto.longitude) ||
                dto.longitude < -180 ||
                dto.longitude > 180
            ) {
                throw new BadRequest(
                    "Invalid service coordinates",
                    "INVALID_SERVICE_COORDINATES"
                );
            }

            if (
                dto.serviceRadiusKm === undefined ||
                !Number.isFinite(dto.serviceRadiusKm) ||
                dto.serviceRadiusKm < 0.1 ||
                dto.serviceRadiusKm > 100
            ) {
                throw new BadRequest(
                    "Service radius must be between 0.1 and 100 km",
                    "INVALID_SERVICE_RADIUS"
                );
            }
        }


        // 6. Validate workshop location
        if (requiresWorkshopLocation) {

            if (!dto.workshopAddress?.trim()) {
                throw new BadRequest(
                    "Workshop address is required",
                    "WORKSHOP_ADDRESS_REQUIRED"
                );
            }
        }


        // 7. Build updated application properties
        const updatedProps: MechanicApplicationProps = {

            userId: application.userId,
            status: application.status,

            ...(application.id !== undefined && {
                id: application.id
            }),

            ...(application.profilePhotoKey !== undefined && {
                profilePhotoKey: application.profilePhotoKey
            }),

            ...(application.experienceYears !== undefined && {
                experienceYears: application.experienceYears
            }),

            specialization: application.specializations,
            supportedVehicleTypes: application.supportedVehicleType,
            serviceOffered: application.serviceOffered,

            ...(application.professionalDescription !== undefined && {
                professionalDescription: application.professionalDescription
            }),

            serviceModel: dto.serviceModel,

            ...(requiresMobileLocation && {
                serviceAddress: dto.serviceAddress!,
                latitude: dto.latitude!,
                longitude: dto.longitude!,
                serviceRadiusKm: dto.serviceRadiusKm!,

                ...(dto.pincode !== undefined && {
                    pincode: dto.pincode
                })
            }),

            ...(requiresWorkshopLocation && {
                workshopAddress: dto.workshopAddress!,

                ...(dto.workshopName !== undefined && {
                    workshopName: dto.workshopName
                })
            }),

            documents: application.documents,

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

            ...(application.updatedAt !== undefined && {
                updatedAt: application.updatedAt
            })
        };


        const updatedApplication =
            new MechanicApplication(updatedProps);


        // 8. Determine fields that should be removed
        const unsetFields: string[] = [];

        if (dto.serviceModel === "mobile") {
            unsetFields.push(
                "workshopName",
                "workshopAddress"
            );
        }

        if (dto.serviceModel === "workshop") {
            unsetFields.push(
                "serviceAddress",
                "pincode",
                "latitude",
                "longitude",
                "serviceRadiusKm"
            );
        }


        // 9. Update application in database
        const savedApplication =
            await this.mechanicApplicationRepository.update(
                application.id,
                updatedApplication,
                unsetFields
            );

        if (!savedApplication) {
            throw new BadRequest(
                "Unable to update service location",
                "SERVICE_LOCATION_UPDATE_FAILED"
            );
        }

        // 10. Return updated application
        return savedApplication;
    }
}
