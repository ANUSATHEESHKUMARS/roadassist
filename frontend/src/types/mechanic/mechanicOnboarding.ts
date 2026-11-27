
export type MechanicType = "mobile" | "workshop" | "both";
export type LocationCaptureSource = "gps" | "map" | "manual";

export type VehicleSpecialization =
  | "car"
  | "bike"
  | "auto"
  | "ev";

export type MechanicApplicationStatus =
  | "incomplete"
  | "pending"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected";

export interface AddressInfo {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface WorkshopInfo {
  workshopName: string;
  workshopAddress: string;
  operatingHours?: string;
}



export type MechanicDocumentType =
  | "id_proof"
  | "mechanic_certificate"
  | "trade_license";


export interface DocumentEntry {
  documentType: MechanicDocumentType;
  fileKey: string;
  originalName: string;
  mimeType: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface MechanicSpecializationSelection {
    categoryId: string;
    subcategoryIds: string[];
}

export interface MechanicOnboardingRequest {
  profilePhotoKey?: string;
  experienceYears: number;
  specializations: MechanicSpecializationSelection[];
  supportedVehicleTypes: string[];
  serviceOffered: string[];
  professionalDescription?: string;
  serviceModel: MechanicType;
  serviceAddress?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  locationSource?: LocationCaptureSource;
  serviceRadiusKm?: number;
  workshopName?: string;
  workshopAddress?: string;
  workshopLatitude?: number;
  workshopLongitude?: number;
  workshopLocationSource?: LocationCaptureSource;
  documents: DocumentEntry[];
}
export type SaveMechanicDraftRequest =
  Partial<MechanicOnboardingRequest>;


export interface MechanicApplicationData {
  id?: string;
  userId: string;

  application: MechanicOnboardingRequest;

  status: MechanicApplicationStatus;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewReason?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface OnboardingApiResponse {
  success: boolean;
  message: string;
  data?: MechanicApplicationData;
}