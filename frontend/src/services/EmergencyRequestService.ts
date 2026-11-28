import type {
  CreateEmergencyPaymentOrderResponse,
  CreateEmergencyRequestPayload,
  EmergencyEstimateDetail,
  EmergencyRequestDetail,
  EmergencyRequestStatusResponse,
  EmergencyServiceReport,
  RtcIceConfiguration,
  VerifyEmergencyPaymentPayload,
  VerifyEmergencyPaymentResponse,
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

interface CreatedEmergencyRequest extends EmergencyRequestDetail {
  id?: string;
  _id?: string;
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

  async getMyRequests(): Promise<EmergencyRequestDetail[]> {
    const response = await apiClient.get<
      ApiResponse<EmergencyRequestDetail[]>
    >(API_ROUTES.EMERGENCY_REQUEST.MY_REQUESTS);

    return response.data.data;
  },

  async getRequestStatus(
    requestId: string
  ): Promise<EmergencyRequestStatusResponse> {
    const response = await apiClient.get<
      ApiResponse<EmergencyRequestStatusResponse>
    >(API_ROUTES.EMERGENCY_REQUEST.BY_ID(requestId));

    return response.data.data;
  },
  async getMyActiveRequest(): Promise<EmergencyRequestDetail | null> {
    const response = await apiClient.get<
        ApiResponse<EmergencyRequestDetail | null>
    >(API_ROUTES.EMERGENCY_REQUEST.MY_ACTIVE_REQUEST);

    return response.data.data;
  },

  async getRtcIceConfiguration(): Promise<RtcIceConfiguration> {
    const response = await apiClient.get<ApiResponse<RtcIceConfiguration>>(
      API_ROUTES.EMERGENCY_REQUEST.RTC_CONFIG
    );
    return response.data.data;
  },

  async cancelRequest(
    requestId: string,
    reason?: string
  ): Promise<EmergencyRequestDetail> {
    const response = await apiClient.post<ApiResponse<EmergencyRequestDetail>>(
      API_ROUTES.EMERGENCY_REQUEST.CANCEL(requestId),
      ...(reason?.trim() ? [{ reason: reason.trim() }] : [{}])
    );
    return response.data.data;
  },

  async approveEstimate(
    requestId: string,
    estimateId: string
  ): Promise<EmergencyEstimateDetail> {
    const response = await apiClient.post<ApiResponse<EmergencyEstimateDetail>>(
      API_ROUTES.EMERGENCY_REQUEST.APPROVE_ESTIMATE(requestId, estimateId)
    );
    return response.data.data;
  },

  async rejectEstimate(
    requestId: string,
    estimateId: string,
    reason?: string
  ): Promise<EmergencyEstimateDetail> {
    const response = await apiClient.post<ApiResponse<EmergencyEstimateDetail>>(
      API_ROUTES.EMERGENCY_REQUEST.REJECT_ESTIMATE(requestId, estimateId),
      ...(reason?.trim() ? [{ reason: reason.trim() }] : [{}])
    );
    return response.data.data;
  },

  async createPaymentOrder(
    requestId: string
  ): Promise<CreateEmergencyPaymentOrderResponse> {
    const response = await apiClient.post<
      ApiResponse<CreateEmergencyPaymentOrderResponse>
    >(API_ROUTES.EMERGENCY_REQUEST.CREATE_PAYMENT_ORDER(requestId));
    return response.data.data;
  },

  async verifyPayment(
    requestId: string,
    payload: VerifyEmergencyPaymentPayload
  ): Promise<VerifyEmergencyPaymentResponse> {
    const response = await apiClient.post<
      ApiResponse<VerifyEmergencyPaymentResponse>
    >(API_ROUTES.EMERGENCY_REQUEST.VERIFY_PAYMENT(requestId), payload);
    return response.data.data;
  },

  async getServiceReport(requestId: string): Promise<EmergencyServiceReport> {
    const response = await apiClient.get<ApiResponse<EmergencyServiceReport>>(
      API_ROUTES.EMERGENCY_REQUEST.SERVICE_REPORT(requestId)
    );
    return response.data.data;
  },
};
