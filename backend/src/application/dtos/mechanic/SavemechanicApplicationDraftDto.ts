
import {
    LocationCaptureSource,
    MechanicServiceModel,
    SupportedVehicleType,
    MechanicDocument,
} from "../../../domain/User/entities/MechanicApplication.js";

import {
    MechanicSpecializationSelectionDto
} from "../admin/MechanicSpecializationSelectionDto.js";


export interface SaveMechanicApplicationDraftDto {

    profilePhotoKey?: string;

    experienceYears?: number;

    specializations?: MechanicSpecializationSelectionDto[];

    supportedVehicleTypes?: SupportedVehicleType[];

    serviceOffered?: string[];

    professionalDescription?: string;

    serviceModel?: MechanicServiceModel;

    serviceAddress?: string;

    pincode?: string;

    latitude?: number | string;

    longitude?: number | string;

    locationSource?: LocationCaptureSource;

    serviceRadiusKm?: number | string;

    workshopName?: string;

    workshopAddress?: string;

    workshopLatitude?: number | string;

    workshopLongitude?: number | string;

    workshopLocationSource?: LocationCaptureSource;

    documents?: MechanicDocument[];
}

