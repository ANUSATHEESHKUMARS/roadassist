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

export type EmergencyRequestStatus =
    | "pending"
    | "searching"
    | "assigned"
    | "cancelled"
    | "completed";

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
    status: EmergencyRequestStatus;
}

export interface EmergencyRequestDetail {
    id?: string;
    _id?: string;
    userId: string;
    vehicleId: string;
    location: EmergencyLocation;
    emergencyIssueCategory: EmergencyIssueCategory;
    issueTitle: string;
    issueDescription?: string;
    issueImages: string[];
    status: EmergencyRequestStatus;
    assignedMechanicId: string | null;
    rejectedByMechanicIds: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface EmergencyRequestStatusResponse {
    request: EmergencyRequestDetail;
    mechanicDetails: {
        fullName: string;
        email: string;
        phoneNumber: string;
    } | null;
}

export interface MechanicAvailabilityResponse {
    mechanicId: string;
    isAvailable: boolean;
    latitude: number;
    longitude: number;
    id?: string;
    updatedAt?: string;
}
