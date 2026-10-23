import { EmergencyIssueCategory } from "../../domain/User/entities/EmergencyRequest.js";

export interface CreateEmergencyRequestDto {
    vehicleId: string,
    location: {
        latitude: number,
        longitude: number,
        address?: string
    };
    emergencyIssueCategory:EmergencyIssueCategory;
    issueTitle:string;
    issueDescription: string
    issueImages?:string[]
}

