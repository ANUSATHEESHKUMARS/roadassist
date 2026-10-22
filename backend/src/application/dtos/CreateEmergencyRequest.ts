
export interface CreateEmergencyRequestDto {
    vehicleId: string,
    location: {
        latitude: number,
        longitude: number,
        address?: string
    };
    issueDescription: string
}

