
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "../ui/toast/ToastProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getApiErrorMessage } from "@/api/apiError";
import { createVehicle } from "@/services/VehicleService";

import type {
  VehicleFormData,
  VehicleType,
  FuelType,
} from "@/types/user/vehicle";

import { VehicleImageUpload } from "../vehicle/VehicleImageUpload";
import { VehicleDocumentUpload } from "../vehicle/VehicleDocumentUpload";



const vehicleTypeOptions: VehicleType[] = [
  "car",
  "bike",
  "auto",
  "ev",
];

const fuelOptionsMap: Record<VehicleType, FuelType[]> = {
  car: ["petrol", "diesel"],
  bike: ["petrol", "electric"],
  auto: ["petrol", "electric"],
  ev: ["electric"],
};

const CURRENT_YEAR = new Date().getFullYear();
const MIN_MANUFACTURING_YEAR = 1990;



type VehicleFormErrors = Partial<
  Record<
    | "brand"
    | "model"
    | "registrationNumber"
    | "fuelType"
    | "year"
    | "color",
    string
  >
>;



const formatLabel = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};


const isValidRegistrationNumber = (value: string): boolean => {
  const normalizedValue = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, "");

  const registrationRegex =
    /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/;

  return registrationRegex.test(normalizedValue);
};



export const VehicleForm: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleType: "car",
    brand: "",
    model: "",
    fuelType: "petrol",
    registrationNumber: "",
    year: CURRENT_YEAR,
    color: "",
    vehicleImage: null,
    insuranceCertificateImage: null,
    pucCertificateImage: null,
  });

  const [errors, setErrors] = useState<VehicleFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);



  const clearFieldError = (
    field: keyof VehicleFormErrors
  ): void => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const updatedErrors = { ...prev };
      delete updatedErrors[field];

      return updatedErrors;
    });
  };



  const handleTypeChange = (type: VehicleType): void => {
    const availableFuels = fuelOptionsMap[type];

    setFormData((prev) => ({
      ...prev,
      vehicleType: type,
      fuelType: availableFuels[0],
    }));

    clearFieldError("fuelType");
  };



  const validateForm = (): boolean => {
    const newErrors: VehicleFormErrors = {};

    // Brand validation
    if (!formData.brand.trim()) {
      newErrors.brand = "Please enter the vehicle brand.";
    }

    // Model validation
    if (!formData.model.trim()) {
      newErrors.model = "Please enter the vehicle model.";
    }

    // Registration number validation
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber =
        "Please enter the registration number.";
    } else if (
      !isValidRegistrationNumber(formData.registrationNumber)
    ) {
      newErrors.registrationNumber =
        "Enter a valid registration number, e.g. KL-01-AB-1234.";
    }

    // Fuel type validation
    const availableFuels = fuelOptionsMap[formData.vehicleType];

    if (!availableFuels.includes(formData.fuelType)) {
      newErrors.fuelType =
        "Please select a valid fuel type for this vehicle.";
    }

    // Manufacturing year validation
    if (
      !Number.isInteger(formData.year) ||
      formData.year < MIN_MANUFACTURING_YEAR ||
      formData.year > CURRENT_YEAR
    ) {
      newErrors.year = `Enter a year between ${MIN_MANUFACTURING_YEAR} and ${CURRENT_YEAR}.`;
    }

    // Color validation
    if (!formData.color.trim()) {
      newErrors.color = "Please enter the vehicle color.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    // Validate before calling the backend
    if (!validateForm()) {
      showToast(
        "Please correct the errors in the form.",
        "error"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Normalize text fields before sending
      const payload: VehicleFormData = {
        ...formData,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        registrationNumber: formData.registrationNumber
          .trim()
          .toUpperCase(),
        color: formData.color.trim(),
      };

      const response = await createVehicle(payload);

      console.log("Vehicle created successfully:", response);

      showToast("Vehicle created successfully", "success");

      navigate("/user/vehicles");
    } catch (error: unknown) {
      console.error("Vehicle creation failed:", error);

      const message = getApiErrorMessage(error);

      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const renderError = (
    message: string | undefined
  ): React.ReactNode => {
    if (!message) {
      return null;
    }

    return (
      <p className="text-xs text-destructive" role="alert">
        {message}
      </p>
    );
  };

 

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8"
    >
      {/* GENERAL INFORMATION */}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="mb-5 text-base font-bold text-card-foreground">
          General Information
        </h2>

        {/* Vehicle Category */}

        <div className="mb-6 space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vehicle Category
          </Label>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {vehicleTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={formData.vehicleType === type}
                onClick={() => handleTypeChange(type)}
                className={`
                  rounded-xl border px-4 py-2.5 text-center
                  text-xs font-bold transition-all
                  ${
                    formData.vehicleType === type
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                  }
                `}
              >
                {formatLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Fields */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Brand */}

          <div className="space-y-1.5">
            <Label
              htmlFor="brand"
              className="text-xs font-semibold text-card-foreground"
            >
              Make / Brand *
            </Label>

            <Input
              id="brand"
              name="brand"
              required
              autoComplete="off"
              placeholder="e.g. Tesla, BMW, Honda"
              value={formData.brand}
              aria-invalid={Boolean(errors.brand)}
              aria-describedby={
                errors.brand ? "brand-error" : undefined
              }
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  brand: e.target.value,
                }));

                clearFieldError("brand");
              }}
              className="h-10 rounded-xl border-border bg-input text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />

            {errors.brand && (
              <div id="brand-error">
                {renderError(errors.brand)}
              </div>
            )}
          </div>

          {/* Model */}

          <div className="space-y-1.5">
            <Label
              htmlFor="model"
              className="text-xs font-semibold text-card-foreground"
            >
              Model Name *
            </Label>

            <Input
              id="model"
              name="model"
              required
              autoComplete="off"
              placeholder="e.g. Model 3, R 1250 GS, City"
              value={formData.model}
              aria-invalid={Boolean(errors.model)}
              aria-describedby={
                errors.model ? "model-error" : undefined
              }
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  model: e.target.value,
                }));

                clearFieldError("model");
              }}
              className="h-10 rounded-xl border-border bg-input text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />

            {errors.model && (
              <div id="model-error">
                {renderError(errors.model)}
              </div>
            )}
          </div>

          {/* Registration Number */}

          <div className="space-y-1.5">
            <Label
              htmlFor="registrationNumber"
              className="text-xs font-semibold text-card-foreground"
            >
              Registration Number *
            </Label>

            <Input
              id="registrationNumber"
              name="registrationNumber"
              required
              autoComplete="off"
              placeholder="e.g. KL-01-AB-1234"
              value={formData.registrationNumber}
              aria-invalid={Boolean(errors.registrationNumber)}
              aria-describedby={
                errors.registrationNumber
                  ? "registrationNumber-error"
                  : undefined
              }
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  registrationNumber: e.target.value.toUpperCase(),
                }));

                clearFieldError("registrationNumber");
              }}
              className="h-10 rounded-xl border-border bg-input font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />

            {errors.registrationNumber && (
              <div id="registrationNumber-error">
                {renderError(errors.registrationNumber)}
              </div>
            )}
          </div>

          {/* Fuel Type */}

          <div className="space-y-1.5">
            <Label
              htmlFor="fuelType"
              className="text-xs font-semibold text-card-foreground"
            >
              Fuel Type *
            </Label>

            <select
              id="fuelType"
              name="fuelType"
              required
              value={formData.fuelType}
              aria-invalid={Boolean(errors.fuelType)}
              aria-describedby={
                errors.fuelType ? "fuelType-error" : undefined
              }
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  fuelType: e.target.value as FuelType,
                }));

                clearFieldError("fuelType");
              }}
              className="h-10 w-full rounded-xl border border-border bg-input px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {fuelOptionsMap[formData.vehicleType].map(
                (fuel) => (
                  <option key={fuel} value={fuel}>
                    {formatLabel(fuel)}
                  </option>
                )
              )}
            </select>

            {errors.fuelType && (
              <div id="fuelType-error">
                {renderError(errors.fuelType)}
              </div>
            )}
          </div>

          {/* Manufacturing Year */}

          <div className="space-y-1.5">
            <Label
              htmlFor="year"
              className="text-xs font-semibold text-card-foreground"
            >
              Manufacturing Year *
            </Label>

            <Input
              id="year"
              name="year"
              type="number"
              min={MIN_MANUFACTURING_YEAR}
              max={CURRENT_YEAR}
              step={1}
              required
              value={formData.year === 0 ? "" : formData.year}
              aria-invalid={Boolean(errors.year)}
              aria-describedby={
                errors.year ? "year-error" : undefined
              }
              onChange={(e) => {
                const value = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  year: value === "" ? 0 : Number(value),
                }));

                clearFieldError("year");
              }}
              className="h-10 rounded-xl border-border bg-input text-xs text-foreground focus-visible:ring-primary"
            />

            {errors.year && (
              <div id="year-error">
                {renderError(errors.year)}
              </div>
            )}
          </div>

          {/* Color */}

          <div className="space-y-1.5">
            <Label
              htmlFor="color"
              className="text-xs font-semibold text-card-foreground"
            >
              Vehicle Color *
            </Label>

            <Input
              id="color"
              name="color"
              required
              placeholder="e.g. Black, White, Red"
              value={formData.color}
              aria-invalid={Boolean(errors.color)}
              aria-describedby={
                errors.color ? "color-error" : undefined
              }
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  color: e.target.value,
                }));

                clearFieldError("color");
              }}
              className="h-10 rounded-xl border-border bg-input text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />

            {errors.color && (
              <div id="color-error">
                {renderError(errors.color)}
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="mb-5 text-base font-bold text-card-foreground">
          Vehicle Photographs & Certificates
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Vehicle Image */}

          <VehicleImageUpload
            value={formData.vehicleImage}
            onChange={(file) =>
              setFormData((prev) => ({
                ...prev,
                vehicleImage: file,
              }))
            }
          />

          <div className="space-y-4">
            {/* Insurance Certificate */}

            <VehicleDocumentUpload
              label="Insurance Certificate"
              description="Upload your insurance certificate"
              onChange={(file) =>
                setFormData((prev) => ({
                  ...prev,
                  insuranceCertificateImage: file,
                }))
              }
            />

            {/* PUC Certificate */}

            <VehicleDocumentUpload
              label="PUC Certificate"
              description="Upload your PUC certificate"
              onChange={(file) =>
                setFormData((prev) => ({
                  ...prev,
                  pucCertificateImage: file,
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}

      <div className="flex items-center justify-end gap-3 pt-2">
        {/* Cancel */}

        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => navigate("/user/vehicles")}
          className="h-10 rounded-xl border-border bg-secondary px-5 text-xs text-secondary-foreground hover:bg-accent"
        >
          Cancel
        </Button>

        {/* Save */}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-xl bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          {isSubmitting ? "Saving..." : "Save Vehicle"}
        </Button>
      </div>
    </form>
  );
};
