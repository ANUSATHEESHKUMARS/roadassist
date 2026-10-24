export type EmergencyIssueCategory =
    | "battery"
    | "flat_tyre"
    | "engine"
    | "brake"
    | "electrical"
    | "fuel"
    | "accident"
    | "overheating"
    | "noise"
    | "other";



export interface EmergencyLocation {
    latitude: number,
    longitude: number,
    address?: string
}

export interface EmergencyVehicleOption {
    id: string,
    brand: string,
    model: string,
    registratioNumber: string,
    vehicleType?: string

}

export interface CreateEmergencyRequestPayload {
    vehicleId: string,
    location: EmergencyLocation,
    emergencyIssueCategory: EmergencyIssueCategory,
    issueTitle: string,
    issueDescription: string,
    issueImages: string[];
}

export interface EmergencyRequestResponse {
    id: string,
    status: "pending" | "searching" | "assigned" | "cancelled" | "completed";
}


