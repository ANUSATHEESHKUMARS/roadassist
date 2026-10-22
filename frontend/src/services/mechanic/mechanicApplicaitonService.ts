
import apiClient from "../apiClient";

import type {
  MechanicOnboardingRequest,
  SaveMechanicDraftRequest,
  OnboardingApiResponse,
} from "@/types/mechanic/mechanicOnboarding";

import type{  MechanicDocumentType } from '../../types/mechanic/common'

export const saveMechanicDraft = async (
  payload: SaveMechanicDraftRequest
): Promise<OnboardingApiResponse> => {
  const response = await apiClient.patch<OnboardingApiResponse>(
    "/mechanic/draft",
    payload
  );

  
  return response.data;
};



export const submitMechanicApplication = async (
  payload: MechanicOnboardingRequest
): Promise<OnboardingApiResponse> => {
  const response = await apiClient.post<OnboardingApiResponse>(
    "/mechanic/submit",
    payload
  );

  return response.data;
};



export interface UploadedDocument {
  fileKey: string;
  fileUrl?: string;
}

interface MediaUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    fileKey?: string;
    url?: string;
    fileUrl?: string;
  };
}



const uploadMechanicMedia = async (
  file: File,
  section: "mechanic_verification" | "mechanic_profile",
  documentType?: MechanicDocumentType
): Promise<UploadedDocument> => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("section", section);

  if (documentType) {
    formData.append("documentType", documentType);
  }

  const response = await apiClient.post<MediaUploadResponse>(
    "/mechanic/media/upload",
    formData
  );

  const result = response.data;
  const uploadedFile = result.data;

  if (!result.success || !uploadedFile?.fileKey) {
    throw new Error(
      result.message || "Failed to upload media."
    );
  }

  return {
    fileKey: uploadedFile.fileKey,
    fileUrl: uploadedFile.url ?? uploadedFile.fileUrl,
  };
};



export const uploadOnboardingDocument = async (
  file: File,
  documentType: MechanicDocumentType
): Promise<UploadedDocument> => {
  return uploadMechanicMedia(
    file,
    "mechanic_verification",
    documentType
  );
};



export const uploadMechanicProfilePhoto = async (
  file: File
): Promise<UploadedDocument> => {
  return uploadMechanicMedia(
    file,
    "mechanic_profile"
  );
};
