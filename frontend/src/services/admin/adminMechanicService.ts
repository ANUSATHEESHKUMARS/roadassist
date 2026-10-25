
import apiClient from "../apiClient";

export type MechanicApplicationStatus =
  | "incomplete"
  | "pending"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected";

export interface MechanicApplicationDocument {
  documentType: string;
  originalName: string;
  verificationStatus: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  fileKey?: string;
}

export interface MechanicApplication {
  id: string;
  userId: string;
  status: MechanicApplicationStatus;
  experienceYears?: number;
  specializations?: string[];
  supportedVehicleType?: string[];
  serviceOffered?: string[];
  serviceModel?: string;
  serviceAddress?: string;
  workshopName?: string;
  workshopAddress?: string;
  pincode?: string;
  professionalDescription?: string;
  documents?: MechanicApplicationDocument[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewReason?: string;
}

export interface MechanicApplicationsResponse {
  success: boolean;
  message: string;
  data: MechanicApplication[];
}

export interface MechanicApplicationActionResponse {
  success: boolean;
  message: string;
  data: MechanicApplication;
}

export const getMechanicApplications = async (
  status: MechanicApplicationStatus = "pending"
): Promise<MechanicApplicationsResponse> => {
  const response = await apiClient.get<MechanicApplicationsResponse>(
    "/admin/mechanic-applications",
    {
      params: { status },
    }
  );

  return response.data;
};

export const approveMechanicApplication = async (
  applicationId: string
): Promise<MechanicApplicationActionResponse> => {
  const response = await apiClient.patch<MechanicApplicationActionResponse>(
    `/admin/mechanic-applications/${applicationId}/approve`
  );

  return response.data;
};

export const rejectMechanicApplication = async (
  applicationId: string,
  reason: string
): Promise<MechanicApplicationActionResponse> => {
  const response = await apiClient.patch<MechanicApplicationActionResponse>(
    `/admin/mechanic-applications/${applicationId}/reject`,
    { reason }
  );

  return response.data;
};
