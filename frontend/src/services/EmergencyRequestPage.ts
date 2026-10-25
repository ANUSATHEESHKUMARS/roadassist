import type {
  CreateEmergencyRequestPayload,
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
};