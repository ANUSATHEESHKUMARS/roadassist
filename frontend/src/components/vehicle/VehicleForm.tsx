import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const formatLabel = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const VehicleForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleType: "car",
    brand: "",
    model: "",
    fuelType: "petrol",
    registrationNumber: "",
    year: new Date().getFullYear(),
    color: "",
    vehicleImage: null,
    insuranceCertificateImage: null,
    pucCertificateImage: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (type: VehicleType): void => {
    const availableFuels = fuelOptionsMap[type];

    setFormData((prev) => ({
      ...prev,
      vehicleType: type,
      fuelType: availableFuels[0],
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const response = await createVehicle(formData);

      console.log("Vehicle created successfully:", response);

      navigate("/user/vehicles");
    }catch (error: any) {
  console.error("VEHICLE CREATION FAILED");
  console.error("STATUS:", error.response?.status);
  console.error("DATA:", error.response?.data);
  console.error("MESSAGE:", error.message);
  console.error("FULL ERROR:", error);
}finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* =========================================
          GENERAL INFORMATION
      ========================================== */}

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">

        <h2 className="text-base font-bold text-card-foreground mb-5">
          General Information
        </h2>

        {/* Vehicle Category */}
        <div className="space-y-2 mb-6">

          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vehicle Category
          </Label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">

            {vehicleTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`
                  py-2.5
                  px-4
                  rounded-xl
                  text-xs
                  font-bold
                  border
                  transition-all
                  text-center
                  ${
                    formData.vehicleType === type
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "bg-secondary border-border text-secondary-foreground hover:bg-accent"
                  }
                `}
              >
                {formatLabel(type)}
              </button>
            ))}

          </div>
        </div>

        {/* Vehicle Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
              required
              placeholder="e.g. Tesla, BMW, Honda"
              value={formData.brand}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  brand: e.target.value,
                }))
              }
              className="bg-input border-border text-foreground placeholder:text-muted-foreground text-xs h-10 rounded-xl focus-visible:ring-primary"
            />

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
              required
              placeholder="e.g. Model 3, R 1250 GS, City"
              value={formData.model}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  model: e.target.value,
                }))
              }
              className="bg-input border-border text-foreground placeholder:text-muted-foreground text-xs h-10 rounded-xl focus-visible:ring-primary"
            />

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
              required
              placeholder="e.g. KL-01-AB-1234"
              value={formData.registrationNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  registrationNumber: e.target.value,
                }))
              }
              className="bg-input border-border font-mono text-foreground placeholder:text-muted-foreground text-xs h-10 rounded-xl focus-visible:ring-primary"
            />

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
              value={formData.fuelType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fuelType: e.target.value as FuelType,
                }))
              }
              className="
                w-full
                h-10
                rounded-xl
                border
                border-border
                bg-input
                px-3
                text-xs
                text-foreground
                focus:outline-none
                focus:ring-2
                focus:ring-primary
              "
            >
              {fuelOptionsMap[formData.vehicleType].map((fuel) => (
                <option key={fuel} value={fuel}>
                  {formatLabel(fuel)}
                </option>
              ))}
            </select>

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
              type="number"
              min={1990}
              max={new Date().getFullYear()}
              required
              value={formData.year}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  year: Number(e.target.value),
                }))
              }
              className="bg-input border-border text-foreground text-xs h-10 rounded-xl focus-visible:ring-primary"
            />

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
              required
              placeholder="e.g. Black, White, Red"
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  color: e.target.value,
                }))
              }
              className="bg-input border-border text-foreground placeholder:text-muted-foreground text-xs h-10 rounded-xl focus-visible:ring-primary"
            />

          </div>

        </div>
      </div>

      {/* =========================================
          VEHICLE IMAGE & CERTIFICATES
      ========================================== */}

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">

        <h2 className="text-base font-bold text-card-foreground mb-5">
          Vehicle Photographs & Certificates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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

      {/* =========================================
          ACTION BUTTONS
      ========================================== */}

      <div className="flex items-center justify-end gap-3 pt-2">

        {/* Cancel */}
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/user/vehicles")}
          className="
            border-border
            bg-secondary
            hover:bg-accent
            text-secondary-foreground
            text-xs
            h-10
            px-5
            rounded-xl
          "
        >
          Cancel
        </Button>

        {/* Save */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="
            bg-primary
            hover:bg-primary/90
            text-primary-foreground
            text-xs
            font-semibold
            h-10
            px-6
            rounded-xl
            shadow-sm
          "
        >
          {isSubmitting ? "Saving..." : "Save Vehicle"}
        </Button>

      </div>

    </form>
  );
};