import apiClient from "./apiClient";

import type { VehicleFormData } from "@/types/user/vehicle";

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