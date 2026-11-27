export type MechanicServiceModel =
    | "mobile"
    | "workshop"
    | "both";

export type LocationCaptureSource = "gps" | "map" | "manual";

export interface MechanicApplication {
    id: string;
    userId: string;

    serviceModel?: MechanicServiceModel;
    serviceAddress?: string;
    pincode?: string;

    latitude?: number;
    longitude?: number;
    locationSource?: LocationCaptureSource;
    serviceRadiusKm?: number;

    workshopName?: string;
    workshopAddress?: string;
    workshopLatitude?: number;
    workshopLongitude?: number;
    workshopLocationSource?: LocationCaptureSource;

    status: string;
    reviewReason?: string;
}

export interface UpdateMechanicServiceLocationDto {
    serviceModel: MechanicServiceModel;

    serviceAddress?: string;
    pincode?: string;

    latitude?: number;
    longitude?: number;
    locationSource?: LocationCaptureSource;
    serviceRadiusKm?: number;

    workshopName?: string;
    workshopAddress?: string;
    workshopLatitude?: number;
    workshopLongitude?: number;
    workshopLocationSource?: LocationCaptureSource;
}