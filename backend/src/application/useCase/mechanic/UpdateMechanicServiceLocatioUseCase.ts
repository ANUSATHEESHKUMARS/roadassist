import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";
import {
    IMechanicApplicationRepository,
    ServiceLocationUpdateData,
} from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IUpdateMechanicServiceLocationUseCase } from "../../../domain/repositories/mechanic/IUpdateMechanicServiceLoatonUseCase.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { UpdateMechanicServiceLocationDto } from "../../dtos/mechanic/UpdateMechanicservicelocationDto.js";

function parseFiniteNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
}

export class UpdateMechanicServiceLocationUseCase
    implements IUpdateMechanicServiceLocationUseCase
{
    constructor(
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository
    ) {}

    async execute(
        userId: string,
        dto: UpdateMechanicServiceLocationDto
    ): Promise<MechanicApplication> {
        if (!dto || typeof dto !== "object") {
            throw new BadRequest(
                "Service location payload is required",
                "INVALID_PAYLOAD"
            );
        }

        const application =
            await this.mechanicApplicationRepository.findByUserId(userId);

        if (!application) {
            throw new NotfoundError(
                "Mechanic application not found. Complete your mechanic onboarding first.",
                "APPLICATION_NOT_FOUND"
            );
        }

        if (!application.id) {
            throw new BadRequest(
                "Application ID is missing",
                "APPLICATION_ID_MISSING"
            );
        }

        if (application.status !== "approved") {
            throw new ForbiddenError(
                `Only approved mechanics can update their service location (current status: ${application.status})`,
                "APPLICATION_NOT_APPROVED"
            );
        }

        if (!["mobile", "workshop", "both"].includes(dto.serviceModel)) {
            throw new BadRequest(
                "Invalid service model",
                "INVALID_SERVICE_MODEL"
            );
        }

        const requiresMobileLocation =
            dto.serviceModel === "mobile" || dto.serviceModel === "both";
        const requiresWorkshopLocation =
            dto.serviceModel === "workshop" || dto.serviceModel === "both";

        const parsedLatitude = parseFiniteNumber(dto.latitude);
        const parsedLongitude = parseFiniteNumber(dto.longitude);
        const parsedRadius = parseFiniteNumber(dto.serviceRadiusKm);

        if (requiresMobileLocation) {
            if (!dto.serviceAddress?.trim()) {
                throw new BadRequest(
                    "Service address is required",
                    "SERVICE_ADDRESS_REQUIRED"
                );
            }

            if (typeof dto.pincode !== "string" || !/^\d{6}$/.test(dto.pincode.trim())) {
                throw new BadRequest(
                    "Enter a valid 6-digit Indian pincode",
                    "INVALID_PINCODE"
                );
            }

            if (parsedLatitude === undefined || parsedLongitude === undefined) {
                throw new BadRequest(
                    "Service coordinates are required",
                    "SERVICE_COORDINATES_REQUIRED"
                );
            }

            if (
                !Number.isFinite(parsedLatitude) ||
                parsedLatitude < -90 ||
                parsedLatitude > 90 ||
                !Number.isFinite(parsedLongitude) ||
                parsedLongitude < -180 ||
                parsedLongitude > 180
            ) {
                throw new BadRequest(
                    "Invalid service coordinates",
                    "INVALID_SERVICE_COORDINATES"
                );
            }

            if (
                parsedRadius === undefined ||
                !Number.isFinite(parsedRadius) ||
                parsedRadius < 0.1 ||
                parsedRadius > 100
            ) {
                throw new BadRequest(
                    "Service radius must be between 0.1 and 100 km",
                    "INVALID_SERVICE_RADIUS"
                );
            }
        } else {
            // Workshop-only mechanics: validate optional coordinates/radius if provided
            if (parsedLatitude !== undefined || parsedLongitude !== undefined) {
                if (
                    parsedLatitude === undefined ||
                    parsedLongitude === undefined ||
                    !Number.isFinite(parsedLatitude) ||
                    parsedLatitude < -90 ||
                    parsedLatitude > 90 ||
                    !Number.isFinite(parsedLongitude) ||
                    parsedLongitude < -180 ||
                    parsedLongitude > 180
                ) {
                    throw new BadRequest(
                        "Invalid workshop coordinates",
                        "INVALID_SERVICE_COORDINATES"
                    );
                }
            }

            if (
                parsedRadius !== undefined &&
                (!Number.isFinite(parsedRadius) ||
                    parsedRadius < 0.1 ||
                    parsedRadius > 100)
            ) {
                throw new BadRequest(
                    "Service radius must be between 0.1 and 100 km",
                    "INVALID_SERVICE_RADIUS"
                );
            }
        }

        if (requiresWorkshopLocation) {
            if (!dto.workshopName?.trim()) {
                throw new BadRequest(
                    "Workshop name is required",
                    "WORKSHOP_NAME_REQUIRED"
                );
            }

            if (!dto.workshopAddress?.trim()) {
                throw new BadRequest(
                    "Workshop address is required",
                    "WORKSHOP_ADDRESS_REQUIRED"
                );
            }
        }

        // Targeted service-location fields only (do NOT touch unrelated application fields)
        const setFields: ServiceLocationUpdateData = {
            serviceModel: dto.serviceModel,
            ...(requiresMobileLocation && {
                serviceAddress: dto.serviceAddress!.trim(),
                pincode: dto.pincode!.trim(),
                latitude: parsedLatitude!,
                longitude: parsedLongitude!,
                serviceRadiusKm: parsedRadius!,
            }),
            ...(!requiresMobileLocation &&
                parsedLatitude !== undefined &&
                parsedLongitude !== undefined && {
                    latitude: parsedLatitude,
                    longitude: parsedLongitude,
                }),
            ...(!requiresMobileLocation &&
                parsedRadius !== undefined && {
                    serviceRadiusKm: parsedRadius,
                }),
            ...(requiresWorkshopLocation && {
                workshopName: dto.workshopName!.trim(),
                workshopAddress: dto.workshopAddress!.trim(),
            }),
        };

        const unsetFields: string[] = [];

        if (dto.serviceModel === "mobile") {
            unsetFields.push("workshopName", "workshopAddress");
        }

        if (dto.serviceModel === "workshop") {
            // Preserve latitude, longitude, serviceRadiusKm so customer discovery still finds the workshop
            unsetFields.push("serviceAddress", "pincode");
        }

        const savedApplication =
            await this.mechanicApplicationRepository.updateServiceLocation(
                application.id,
                setFields,
                unsetFields
            );

        if (!savedApplication) {
            throw new BadRequest(
                "Unable to update service location",
                "SERVICE_LOCATION_UPDATE_FAILED"
            );
        }

        return savedApplication;
    }
}
