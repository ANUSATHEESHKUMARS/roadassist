export type EmergencyRequestStatus =
    | "pending"
    | "searching"
    | "assigned"
    | "cancelled"
    | "completed";

    

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
        public issueDescription: string,
        public status: EmergencyRequestStatus = "pending",
        public assignedMechanicId: string | null = null,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date

    ) { }
}