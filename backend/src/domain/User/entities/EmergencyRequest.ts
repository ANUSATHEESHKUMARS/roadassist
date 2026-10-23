export type EmergencyRequestStatus =
    | "pending"
    | "searching"
    | "assigned"
    | "cancelled"
    | "completed";

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
    latitude: number;
    longitude: number,
    address?: string
}


export class EmergencyRequest {
    constructor(
        public userId: string,
        public vehicleId: string,
        public location: EmergencyLocation,
        public emergencyIssueCategory : EmergencyIssueCategory,
        public issueTitle:string,
        public issueDescription: string | undefined,
        public issueImages : string[] = [],
        public status: EmergencyRequestStatus = "pending",
        public assignedMechanicId: string | null = null,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date

    ) { }
}