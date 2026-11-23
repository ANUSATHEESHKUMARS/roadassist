
import apiClient from "../apiClient";
import API_ROUTES from "../apiRoutes";

// ─── Application Status ─────────────────────────────────────

export type MechanicApplicationStatus =
  | "incomplete"
  | "pending"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected";

// ─── Specialization Review Types ────────────────────────────

export type SpecializationVerificationStatus =
  | "pending"
  | "approved"
  | "rejected";

export type SpecializationReviewDecision =
  | "approved"
  | "rejected";

export interface SpecializationReviewHistory {
  decision: SpecializationReviewDecision;
  reviewedBy: string;
  reviewedAt: string;
  rejectionReason?: string;
}

export interface MechanicSubcategory {
  subcategoryId: string;
  verificationStatus: SpecializationVerificationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewHistory?: SpecializationReviewHistory[];
}

export interface MechanicSpecialization {
  categoryId: string;
  subcategories: MechanicSubcategory[];
}

// ─── Mechanic Documents ─────────────────────────────────────

export interface MechanicApplicationDocument {
  documentType: string;
  originalName: string;
  verificationStatus: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  fileKey?: string;
}

// ─── Mechanic Application ───────────────────────────────────

export interface MechanicApplication {
  id: string;
  userId: string;
  status: MechanicApplicationStatus;

  profilePhotoKey?: string;
  experienceYears?: number;

  specializations?: MechanicSpecialization[];

  supportedVehicleTypes?: string[];

  serviceModel?: string;
  serviceAddress?: string;
  workshopName?: string;
  workshopAddress?: string;

  pincode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;

  professionalDescription?: string;

  documents?: MechanicApplicationDocument[];

  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewReason?: string;
}

// ─── API Response Types ─────────────────────────────────────

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

// ─── Review Specialization DTO ──────────────────────────────

export interface ReviewMechanicSpecializationDto {
  decision: SpecializationReviewDecision;
  rejectionReason?: string;
}

// ─── Get Mechanic Applications ──────────────────────────────

export const getMechanicApplications = async (
  status: MechanicApplicationStatus = "pending"
): Promise<MechanicApplicationsResponse> => {
  const response = await apiClient.get<MechanicApplicationsResponse>(
    API_ROUTES.ADMIN.MECHANIC_APPLICATIONS,
    {
      params: { status },
    }
  );

  return response.data;
};

// ─── Approve Mechanic Application ───────────────────────────

export const approveMechanicApplication = async (
  applicationId: string
): Promise<MechanicApplicationActionResponse> => {
  const response = await apiClient.patch<MechanicApplicationActionResponse>(
    API_ROUTES.ADMIN.APPROVE_MECHANIC_APPLICATION(applicationId)
  );

  return response.data;
};

// ─── Reject Mechanic Application ────────────────────────────

export const rejectMechanicApplication = async (
  applicationId: string,
  reason: string
): Promise<MechanicApplicationActionResponse> => {
  const response = await apiClient.patch<MechanicApplicationActionResponse>(
    API_ROUTES.ADMIN.REJECT_MECHANIC_APPLICATION(applicationId),
    { reason }
  );

  return response.data;
};

// ─── Review Individual Specialization ───────────────────────

export const reviewMechanicSpecialization = async (
  applicationId: string,
  categoryId: string,
  subcategoryId: string,
  dto: ReviewMechanicSpecializationDto
): Promise<MechanicApplicationActionResponse> => {
  const response = await apiClient.patch<MechanicApplicationActionResponse>(
    API_ROUTES.ADMIN.REVIEW_MECHANIC_SPECIALIZATION(
      applicationId,
      categoryId,
      subcategoryId
    ),
    dto
  );

  return response.data;
};
