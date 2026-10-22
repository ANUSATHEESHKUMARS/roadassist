// import type {
//   MechanicApplicationStatus,
//   MechanicServiceModel,
//   SupportedVehicleType,
//   MechanicDocumentStatus,
// } from "../mechanic/common";

// export type {
//   MechanicApplicationStatus,
//   MechanicServiceModel,
//   SupportedVehicleType,
//   MechanicDocumentStatus,
// } from "../mechanic/common";

// export type MechanicDocumentStatus =
//   | "pending"
//   | "verified"
//   | "rejected";

// export interface MechanicDocumentDTO {
//   documentType: string;
//   fileKey: string;
//   originalName: string;
//   mimeType: string;
//   verificationStatus: MechanicDocumentStatus;
//   rejectionReason?: string;
//   url?: string;
// }

// export interface MechanicUserDTO {
//   _id: string;
//   fullName?: string;
//   email?: string;
//   phoneNumber?: string;
//   profileImage?: string;
// }

// export interface MechanicApplicationDTO {
//   id?: string;
//   _id?: string;

//   userId: string | MechanicUserDTO;

//   profilePhotoKey?: string;
//   experienceYears?: number;
//   specialization?: string[];
//   supportedVehicleTypes?: SupportedVehicleType[];
//   serviceOffered?: string[];
//   professionalDescription?: string;

//   serviceModel?: MechanicServiceModel;
//   serviceAddress?: string;
//   pincode?: string;
//   latitude?: number;
//   longitude?: number;
//   serviceRadiusKm?: number;

//   workshopName?: string;
//   workshopAddress?: string;

//   documents?: MechanicDocumentDTO[];

//   status: MechanicApplicationStatus;

//   submittedAt?: string;
//   reviewedBy?: string;
//   reviewedAt?: string;
//   reviewReason?: string;

//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface MechanicStats {
//   total: number;
//   pending: number;
//   underReview: number;
//   approved: number;
//   rejected: number;
// }
