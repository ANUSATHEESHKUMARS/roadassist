
export type MechanicApplicationStatus =
  | "incomplete"
  | "pending"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected";

export type MechanicServiceModel =
  | "mobile"
  | "workshop"
  | "both";

export type SupportedVehicleType =
  | "car"
  | "bike"
  | "auto"
  | "ev";

export type MechanicDocumentType =
  | "id_proof"
  | "mechanic_certificate"
  | "trade_license";

export type MechanicDocumentStatus =
  | "pending"
  | "verified"
  | "rejected";

export interface MechanicDocument {
  documentType: MechanicDocumentType;
  fileKey: string;
  originalName: string;
  mimeType: string;
  fileUrl?: string;
  fileSize?: number;
  verificationStatus: MechanicDocumentStatus;
  rejectionReason?: string;
}
