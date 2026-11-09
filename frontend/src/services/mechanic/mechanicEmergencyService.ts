import type {
    EmergencyRequestDetail,
    MechanicAvailabilityResponse,
} from "@/types/emergencyRequest";

import apiClient from "../apiClient";
import API_ROUTES from "../apiRoutes";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const mechanicEmergencyService = {
    /** Toggle availability and send current location */
    async updateAvailability(
        isAvailable: boolean,
        latitude: number,
        longitude: number
    ): Promise<MechanicAvailabilityResponse> {
        const response = await apiClient.patch<
            ApiResponse<MechanicAvailabilityResponse>
        >(API_ROUTES.MECHANIC.AVAILABILITY, {
            isAvailable,
            latitude,
            longitude,
        });

        return response.data.data;
    },

    /** Fetch emergency requests within 5 km */
    async getNearbyRequests(): Promise<EmergencyRequestDetail[]> {
        const response = await apiClient.get<
            ApiResponse<EmergencyRequestDetail[]>
        >(API_ROUTES.MECHANIC.NEARBY_EMERGENCY_REQUESTS);

        return response.data.data;
    },

    /** Accept an emergency request */
    async acceptRequest(requestId: string): Promise<EmergencyRequestDetail> {
        const response = await apiClient.post<
            ApiResponse<EmergencyRequestDetail>
        >(API_ROUTES.MECHANIC.ACCEPT_EMERGENCY_REQUEST(requestId));

        return response.data.data;
    },

    /** Reject an emergency request */
    async rejectRequest(requestId: string): Promise<EmergencyRequestDetail> {
        const response = await apiClient.post<
            ApiResponse<EmergencyRequestDetail>
        >(API_ROUTES.MECHANIC.REJECT_EMERGENCY_REQUEST(requestId));

        return response.data.data;
    },
};

