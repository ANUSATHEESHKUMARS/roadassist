import {
    LocationCaptureSource,
    MechanicServiceModel,
} from "../../../domain/User/entities/MechanicApplication.js";

export interface UpdateMechanicServiceLocationDto {
    serviceModel: MechanicServiceModel;

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
}