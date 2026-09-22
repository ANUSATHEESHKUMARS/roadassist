import apiClient from "./apiClient";

import type { Vehicle, VehicleApiResponse, VehicleFormData } from "@/types/user/vehicle";

export const createVehicle = async (data: VehicleFormData) => {
  const formData = new FormData();

  formData.append("registrationNumber", data.registrationNumber);
  formData.append("vehicleType", data.vehicleType);
  formData.append("brand", data.brand);
  formData.append("model", data.model);
  formData.append("year", data.year.toString());
  formData.append("fuelType", data.fuelType);
  formData.append("color", data.color);

  if (data.vehicleImage) {
    formData.append("vehicleImage", data.vehicleImage);
  }

  if (data.insuranceCertificateImage) {
    formData.append(
      "insuranceCertificateImage",
      data.insuranceCertificateImage
    );
  }

  if (data.pucCertificateImage) {
    formData.append(
      "pucCertificateImage",
      data.pucCertificateImage
    );
  }

  const response = await apiClient.post(
    "/vehicle/create",
    formData
  );

  return response.data;
};

export const getVehicleById = async (
  vehicleId: string
): Promise<Vehicle> => {

  const response = await apiClient.get<VehicleApiResponse>(
    `/vehicle/${vehicleId}`
  );

  console.log("DETAIL API RESPONSE:", response.data);

  const vehicle = response.data.getvehiclebyId;

  console.log("DETAIL VEHICLE:", vehicle);

  return vehicle;
};


export const updateVehicle = async (
  vehicleId: string,
  formData: FormData
): Promise<Vehicle> => {
  const response = await apiClient.patch<VehicleApiResponse>(
    `/vehicle/${vehicleId}`,
    formData
  );

  return response.data.getvehiclebyId;
};


export const deleteVehicle = async (
  VehicleId : string
):Promise<void> =>{
    await apiClient.delete(`/vehicle/${VehicleId}`)
}

