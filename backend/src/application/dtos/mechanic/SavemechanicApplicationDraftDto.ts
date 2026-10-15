import {
    MechanicServiceModel,
    SupportedVehicleType,
    MechanicDocument,
} from "../../../domain/User/entities/MechanicApplication.js";

export interface SaveMechanicApplicationDraftDto {
    profilePhotoKey?: string;

    experienceYears?: number;
    specialization?: string[];
    supportedVehicleTypes?: SupportedVehicleType[];
    serviceOffered?: string[];
    professionalDescription?: string;

    serviceModel?: MechanicServiceModel;
    serviceAddress?: string;
    latitude?: number;
    longitude?: number;
    serviceRadiusKm?: number;

    workshopName?: string;
    workshopAddress?: string;

    documents?: MechanicDocument[];
}

