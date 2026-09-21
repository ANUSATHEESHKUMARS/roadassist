export type VehicleType = "car" | "bike" | "auto" | "ev";

export type FuelType = "petrol" | "diesel" | "electric";

export type VehicleStatus =
  | "ACTIVE"
  | "NEEDS SERVICE"
  | "PENDING VERIFICATION"
  | "INACTIVE";

export interface Vehicle {
  id: string;

  registrationNumber: string;

  vehicleType: VehicleType;

  brand: string;

  model: string;

  year: number;

  fuelType: FuelType;

  color: string;

  vehicleImage?: string;

  insuranceCertificateImage?: string;

  pucCertificateImage?: string;

  status?: VehicleStatus;
}

export interface VehicleFormData {
  registrationNumber: string;

  vehicleType: VehicleType;

  brand: string;

  model: string;

  year: number;

  fuelType: FuelType;

  color: string;

  vehicleImage?: File | null;

  insuranceCertificateImage?: File | null;

  pucCertificateImage?: File | null;
}