
import {
    MechanicServiceModel,
    SupportedVehicleType,
    MechanicDocument,
} from "../../../domain/User/entities/MechanicApplication.js";

import {
    MechanicSpecializationSelectionDto
} from "../admin/MechanicSpecializationSelectionDto.js";


export interface SubmitMechanicApplicationDto {

    profilePhotoKey: string;

    experienceYears: number;

    specializations: MechanicSpecializationSelectionDto[];

    supportedVehicleTypes: SupportedVehicleType[];

    serviceOffered?: string[];

    professionalDescription?: string;

    serviceModel: MechanicServiceModel;

    serviceAddress: string;

    pincode?: string;

    latitude?: number;

    longitude?: number;

    serviceRadiusKm?: number;

    workshopName?: string;

    workshopAddress?: string;

    documents: MechanicDocument[];
}
