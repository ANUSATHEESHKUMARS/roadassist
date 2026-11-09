import type {
  CreateEmergencyRequestPayload,
  EmergencyRequestDetail,
  EmergencyRequestStatusResponse,
} from "@/types/emergencyRequest";

import apiClient from "./apiClient";
import API_ROUTES from "./apiRoutes";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface UploadedImages {
  issueImages: string[];
}

interface CreatedEmergencyRequest {
  id?: string;
  _id?: string;
  status: "pending" | "searching" | "assigned" | "cancelled" | "completed";
}

export const emergencyRequestService = {
  async uploadImages(files: File[]): Promise<string[]> {
    if (files.length === 0) return [];

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await apiClient.post<ApiResponse<UploadedImages>>(
      API_ROUTES.EMERGENCY_REQUEST.UPLOAD_IMAGES,
      formData
    );

    return response.data.data.issueImages;
  },

  async createRequest(
    payload: CreateEmergencyRequestPayload
  ): Promise<CreatedEmergencyRequest> {
    const response = await apiClient.post<
      ApiResponse<CreatedEmergencyRequest>
    >(API_ROUTES.EMERGENCY_REQUEST.BASE, payload);

    return response.data.data;
  },

  /** Get all emergency requests for the current user */
  async getMyRequests(): Promise<EmergencyRequestDetail[]> {
    const response = await apiClient.get<
      ApiResponse<EmergencyRequestDetail[]>
    >(API_ROUTES.EMERGENCY_REQUEST.MY_REQUESTS);

    return response.data.data;
  },

  /** Get a single request with assigned mechanic details */
  async getRequestStatus(
    requestId: string
  ): Promise<EmergencyRequestStatusResponse> {
    const response = await apiClient.get<
      ApiResponse<EmergencyRequestStatusResponse>
    >(API_ROUTES.EMERGENCY_REQUEST.BY_ID(requestId));

    return response.data.data;
  },
};
