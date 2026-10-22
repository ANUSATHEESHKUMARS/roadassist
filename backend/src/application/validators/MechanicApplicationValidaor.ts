
import {
  MechanicServiceModel,
  SupportedVehicleType,
} from "../../domain/User/entities/MechanicApplication.js";

import { BadRequest } from "../../shared/errors/BadRequestError.js";

import { SaveMechanicApplicationDraftDto } from "../dtos/mechanic/SavemechanicApplicationDraftDto.js";
import { SubmitMechanicApplicationDto } from "../dtos/mechanic/SubmitMechanicApplicationDto.js";

export class MechanicApplicationValidator {
  private readonly serviceModels: MechanicServiceModel[] = [
    "mobile",
    "workshop",
    "both",
  ];

  private readonly vehicleTypes: SupportedVehicleType[] = [
    "car",
    "bike",
    "auto",
    "ev",
  ];


  validateDraft(data: SaveMechanicApplicationDraftDto): void {
    if (data.profilePhotoKey !== undefined) {
      this.validateNonEmptyString(
        data.profilePhotoKey,
        "Profile photo key cannot be empty",
        "INVALID_PROFILE_PHOTO",
      );
    }

    if (data.experienceYears !== undefined) {
      this.validateExperience(data.experienceYears);
    }

    if (data.specialization !== undefined) {
      this.validateNonEmptyArray(
        data.specialization,
        "Select at least one specialization",
        "INVALID_SPECIALIZATION",
      );
    }

    if (data.supportedVehicleTypes !== undefined) {
      this.validateVehicleTypes(data.supportedVehicleTypes);
    }

    if (data.serviceOffered !== undefined) {
      this.validateNonEmptyArray(
        data.serviceOffered,
        "Select at least one service offered",
        "INVALID_SERVICE_OFFERED",
      );
    }

    if (data.serviceModel !== undefined) {
      this.validateServiceModel(data.serviceModel);
    }

    if (data.serviceAddress !== undefined) {
      this.validateNonEmptyString(
        data.serviceAddress,
        "Service address cannot be empty",
        "INVALID_SERVICE_ADDRESS",
      );
    }

    if (data.pincode !== undefined) {
      this.validatePincode(data.pincode);
    }

    this.validateCoordinates(data.latitude, data.longitude);

    if (data.serviceRadiusKm !== undefined) {
      this.validateServiceRadius(data.serviceRadiusKm);
    }

    if (data.serviceModel === "workshop" ||
      data.serviceModel === "both"
    ) {

      if(data.workshopName !== undefined){
        this.validateNonEmptyString(data.workshopName,'Workshop name',"INVALID_WORKSHOP_NAME")
      }
    }

 if (
  data.serviceModel === "workshop" ||
  data.serviceModel === "both"
) {
  if (data.workshopName !== undefined) {
    this.validateNonEmptyString(
      data.workshopName,
      "Workshop name cannot be empty",
      "INVALID_WORKSHOP_NAME",
    );
  }

  if (data.workshopAddress !== undefined) {
    this.validateNonEmptyString(
      data.workshopAddress,
      "Workshop address cannot be empty",
      "INVALID_WORKSHOP_ADDRESS",
    );
  }
}

    if (data.documents !== undefined) {
      this.validateDocuments(data.documents, false);
    }
  }



  validateSubmission(data: SubmitMechanicApplicationDto): void {
    this.validateNonEmptyString(
      data.profilePhotoKey,
      "Profile photo is required",
      "PROFILE_PHOTO_REQUIRED",
    );

    this.validateExperience(data.experienceYears);

    this.validateNonEmptyArray(
      data.specialization,
      "At least one specialization is required",
      "SPECIALIZATION_REQUIRED",
    );

    this.validateVehicleTypes(data.supportedVehicleTypes);

    this.validateNonEmptyArray(
      data.serviceOffered,
      "At least one service offered is required",
      "SERVICE_OFFERED_REQUIRED",
    );

    this.validateServiceModel(data.serviceModel);

    this.validateNonEmptyString(
      data.serviceAddress,
      "Service address is required",
      "SERVICE_ADDRESS_REQUIRED",
    );

    this.validatePincode(data.pincode ?? "");

    this.validateServiceRadius(data.serviceRadiusKm ?? NaN);

    this.validateCoordinates(data.latitude, data.longitude);

    if (
      data.serviceModel === "workshop" ||
      data.serviceModel === "both"
    ) {
      this.validateNonEmptyString(
        data.workshopName ?? "",
        "Workshop name is required",
        "WORKSHOP_NAME_REQUIRED",
      );

      this.validateNonEmptyString(
        data.workshopAddress ?? "",
        "Workshop address is required",
        "WORKSHOP_ADDRESS_REQUIRED",
      );
    }

    this.validateDocuments(data.documents, true, 2);
  }



  private validateNonEmptyString(
    value: string,
    message: string,
    code: string,
  ): void {
    if (typeof value !== "string" || !value.trim()) {
      throw new BadRequest(message, code);
    }
  }

  private validateNonEmptyArray(
    values: string[],
    message: string,
    code: string,
  ): void {
    if (
      !Array.isArray(values) ||
      values.length === 0 ||
      values.some(
        (value) => typeof value !== "string" || !value.trim(),
      )
    ) {
      throw new BadRequest(message, code);
    }
  }

  private validateExperience(experienceYears: number): void {
    if (
      !Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      experienceYears > 60
    ) {
      throw new BadRequest(
        "Experience must be an integer between 0 and 60",
        "INVALID_EXPERIENCE",
      );
    }
  }

  private validatePincode(pincode: string): void {
    if (typeof pincode !== "string" || !/^\d{6}$/.test(pincode)) {
      throw new BadRequest(
        "Enter a valid 6-digit Indian pincode",
        "INVALID_PINCODE",
      );
    }
  }

  private validateVehicleTypes(
    types: SupportedVehicleType[],
  ): void {
    if (!Array.isArray(types) || types.length === 0) {
      throw new BadRequest(
        "Select at least one supported vehicle type",
        "VEHICLE_TYPE_REQUIRED",
      );
    }

    if (types.some((type) => !this.vehicleTypes.includes(type))) {
      throw new BadRequest(
        "One or more supported vehicle types are invalid",
        "INVALID_VEHICLE_TYPE",
      );
    }
  }

  private validateServiceModel(
    serviceModel: MechanicServiceModel,
  ): void {
    if (!this.serviceModels.includes(serviceModel)) {
      throw new BadRequest(
        "Invalid mechanic service model",
        "INVALID_SERVICE_MODEL",
      );
    }
  }

  private validateServiceRadius(serviceRadiusKm: number): void {
    if (
      !Number.isFinite(serviceRadiusKm) ||
      serviceRadiusKm <= 0 ||
      serviceRadiusKm > 100
    ) {
      throw new BadRequest(
        "Service radius must be greater than 0 and at most 100 km",
        "INVALID_SERVICE_RADIUS",
      );
    }
  }

  private validateCoordinates(
    latitude: number | undefined,
    longitude: number | undefined,
  ): void {
    if (
      (latitude === undefined) !==
      (longitude === undefined)
    ) {
      throw new BadRequest(
        "Latitude and longitude must be provided together",
        "INVALID_COORDINATES",
      );
    }

    if (latitude !== undefined) {
      if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        throw new BadRequest(
          "Latitude must be between -90 and 90",
          "INVALID_LATITUDE",
        );
      }
    }

    if (longitude !== undefined) {
      if (
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new BadRequest(
          "Longitude must be between -180 and 180",
          "INVALID_LONGITUDE",
        );
      }
    }
  }

  private validateDocuments(
    documents: SubmitMechanicApplicationDto["documents"],
    requireMinimum: boolean,
    minimumCount = 1,
  ): void {
    if (!Array.isArray(documents)) {
      throw new BadRequest(
        "Documents must be an array",
        "INVALID_DOCUMENTS",
      );
    }

    if (requireMinimum && documents.length < minimumCount) {
      throw new BadRequest(
        `At least ${minimumCount} verification documents are required`,
        "DOCUMENT_REQUIRED",
      );
    }

 for (const [index, document] of documents.entries()) {
    console.log(
        `Document ${index + 1} received by validator:`,
        JSON.stringify(document, null, 2)
    );

    if (!document || typeof document !== "object") {
        throw new BadRequest(
            `Document ${index + 1} is invalid`,
            "INVALID_DOCUMENT",
        );
    }

    this.validateNonEmptyString(
        document.documentType,
        `Document ${index + 1}: document type is required`,
        "DOCUMENT_TYPE_REQUIRED",
    );



      this.validateNonEmptyString(
        document.fileKey,
        `Document ${index + 1}: file key is required`,
        "DOCUMENT_FILE_REQUIRED",
      );

      this.validateNonEmptyString(
        document.originalName,
        `Document ${index + 1}: original filename is required`,
        "DOCUMENT_FILENAME_REQUIRED",
      );

      this.validateNonEmptyString(
        document.mimeType,
        `Document ${index + 1}: MIME type is required`,
        "DOCUMENT_MIME_TYPE_REQUIRED",
      );
    }
  }
}
