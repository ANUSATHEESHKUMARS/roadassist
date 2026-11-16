export interface MechanicLiveLocationDto {
    requestId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    heading: number | null;
    speed: number | null;
}

export interface StoredMechanicLocation extends MechanicLiveLocationDto {
    mechanicId: string;
    updatedAt: string;
}