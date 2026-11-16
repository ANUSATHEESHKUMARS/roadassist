export type MechanicServiceModel =
    | "mobile"
    | "workshop"
    | "both";

export interface MechanicApplication {
    id: string;
    userId: string;

    serviceModel?: MechanicServiceModel;
    serviceAddress?: string;
    pincode?: string;

    latitude?: number;
    longitude?: number;
    serviceRadiusKm?: number;

    workshopName?: string;
    workshopAddress?: string;

    status: string;
}

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