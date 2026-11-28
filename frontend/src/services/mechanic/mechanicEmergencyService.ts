import type {
    EmergencyEstimateDetail,
    EmergencyEstimateItem,
    EmergencyInspectionDetail,
    EmergencyRepairDetail,
    EmergencyRequestDetail,
    EmergencyServiceReport,
    FindingSeverity,
    MechanicAssignedRequestResponse,
    MechanicAvailabilityResponse,
    RepairPartUsed,
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
    async getAssignedRequests(): Promise<EmergencyRequestDetail[]> {
        const response = await apiClient.get<
            ApiResponse<EmergencyRequestDetail[]>
        >(API_ROUTES.MECHANIC.ASSIGNED_EMERGENCY_REQUESTS);

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

    async getAssignedRequest(
        requestId: string
    ): Promise<MechanicAssignedRequestResponse> {
        const response = await apiClient.get<
            ApiResponse<MechanicAssignedRequestResponse>
        >(API_ROUTES.MECHANIC.ASSIGNED_REQUEST(requestId));

        return response.data.data;
    },

    async startTravel(requestId: string): Promise<EmergencyRequestDetail> {
        const response = await apiClient.patch<ApiResponse<EmergencyRequestDetail>>(API_ROUTES.MECHANIC.START_EMERGENCY_TRAVEL(requestId))
        return response.data.data
    },
    async confirmArrival(requestId: string): Promise<EmergencyRequestDetail> {
        const response = await apiClient.patch<
            ApiResponse<EmergencyRequestDetail>
        >(API_ROUTES.MECHANIC.CONFIRM_EMERGENCY_ARRIVAL(requestId));

        return response.data.data;
    },

    async startInspection(
        requestId: string
    ): Promise<EmergencyInspectionDetail> {
        const response = await apiClient.post<
            ApiResponse<EmergencyInspectionDetail>
        >(API_ROUTES.MECHANIC.START_INSPECTION(requestId));
        return response.data.data;
    },

    async completeInspection(
        requestId: string,
        payload: {
            vehicleConditionSummary: string;
            findings: Array<{
                component: string;
                issue: string;
                severity: FindingSeverity;
                recommendedAction?: string;
            }>;
            requiredRepairs: string[];
            notes?: string;
        }
    ): Promise<EmergencyInspectionDetail> {
        const response = await apiClient.post<
            ApiResponse<EmergencyInspectionDetail>
        >(API_ROUTES.MECHANIC.COMPLETE_INSPECTION(requestId), payload);
        return response.data.data;
    },

    async submitEstimate(
        requestId: string,
        payload: {
            inspectionCharge: number;
            items: EmergencyEstimateItem[];
            estimatedCompletionMinutes?: number;
            notes?: string;
        }
    ): Promise<EmergencyEstimateDetail> {
        const response = await apiClient.post<
            ApiResponse<EmergencyEstimateDetail>
        >(API_ROUTES.MECHANIC.SUBMIT_ESTIMATE(requestId), payload);
        return response.data.data;
    },

    async startRepair(requestId: string): Promise<EmergencyRepairDetail> {
        const response = await apiClient.post<
            ApiResponse<EmergencyRepairDetail>
        >(API_ROUTES.MECHANIC.START_REPAIR(requestId));
        return response.data.data;
    },

    async logRepairProgress(
        requestId: string,
        note: string
    ): Promise<EmergencyRepairDetail> {
        const response = await apiClient.post<
            ApiResponse<EmergencyRepairDetail>
        >(API_ROUTES.MECHANIC.LOG_REPAIR_PROGRESS(requestId), { note });
        return response.data.data;
    },

    async completeRepair(
        requestId: string,
        payload: { workPerformed: string; partsUsed?: RepairPartUsed[] }
    ): Promise<{
        request: EmergencyRequestDetail;
        repair: EmergencyRepairDetail;
    }> {
        const response = await apiClient.post<
            ApiResponse<{
                request: EmergencyRequestDetail;
                repair: EmergencyRepairDetail;
            }>
        >(API_ROUTES.MECHANIC.COMPLETE_REPAIR(requestId), payload);
        return response.data.data;
    },

    async getServiceReport(
        requestId: string
    ): Promise<EmergencyServiceReport> {
        const response = await apiClient.get<
            ApiResponse<EmergencyServiceReport>
        >(API_ROUTES.MECHANIC.SERVICE_REPORT(requestId));
        return response.data.data;
    },
};
