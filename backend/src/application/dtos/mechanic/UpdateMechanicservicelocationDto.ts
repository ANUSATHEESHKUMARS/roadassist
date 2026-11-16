import {
    MechanicServiceModel,
} from "../../../domain/User/entities/MechanicApplication.js";

export interface UpdateMechanicServiceLocationDto {
    serviceModel: MechanicServiceModel;

    serviceAddress?: string;
    pincode?: string;

    latitude?: number;
    longitude?: number;

    serviceRadiusKm?: number;

    workshopName?: string;
    workshopAddress?: string;
}