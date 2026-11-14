import type {
    EmergencyRequestDetail,
    EmergencyRequestStatusResponse,
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

    async getNearbyRequests(): Promise<EmergencyRequestDetail[]> {
        const response = await apiClient.get<
            ApiResponse<EmergencyRequestDetail[]>
        >(API_ROUTES.MECHANIC.NEARBY_EMERGENCY_REQUESTS);

        return response.data.data;
    },

    async acceptRequest(requestId: string): Promise<EmergencyRequestDetail> {
        const response = await apiClient.post<
            ApiResponse<EmergencyRequestDetail>
        >(API_ROUTES.MECHANIC.ACCEPT_EMERGENCY_REQUEST(requestId));

        return response.data.data;
    },

    async rejectRequest(requestId: string): Promise<EmergencyRequestDetail> {
        const response = await apiClient.post<
            ApiResponse<EmergencyRequestDetail>
        >(API_ROUTES.MECHANIC.REJECT_EMERGENCY_REQUEST(requestId));

        return response.data.data;
    },

    /** Get an assigned request's details (for the accepting mechanic) */
    async getAssignedRequest(
        requestId: string
    ): Promise<EmergencyRequestStatusResponse> {
        const response = await apiClient.get<
            ApiResponse<EmergencyRequestStatusResponse>
        >(API_ROUTES.MECHANIC.ASSIGNED_REQUEST(requestId));

        return response.data.data;
    },
};

