
import React from "react";
import {
  MapPin,
  Hash,
  Building2,
  LocateFixed,
  Camera,
  Loader2,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Wrench,
  Trash2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  MechanicOnboardingRequest,
} from "@/types/mechanic/mechanicOnboarding";

interface PersonalProps {
  data: MechanicOnboardingRequest;
  onChange: (fields: Partial<MechanicOnboardingRequest>) => void;
  errors: Record<string, string>;
  onProfilePhotoUpload: (file: File) => void;
  isUploadingProfilePhoto: boolean;
  profilePhotoUrl: string;
  onRemoveProfilePhoto: () => void;
}

export const MechanicPersonalDetailsForm: React.FC<PersonalProps> = ({
  data,
  onChange,
  errors,
  onProfilePhotoUpload,
  isUploadingProfilePhoto,
  profilePhotoUrl,
  onRemoveProfilePhoto,
}) => {


const handleRemovePhoto = () => {
    onChange({
        profilePhotoKey: "",
    });

    onRemoveProfilePhoto();
};

  return (
    <div className="space-y-7">
      {/* Profile Photo */}
      <section className="space-y-4 border-b border-border/60 pb-6">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Profile Photo <span className="text-primary">*</span>
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Upload a clear photo so customers can recognize you.
          </p>
        </div>

        <div className="flex flex-col gap-5 rounded-xl border border-border/70 bg-input/30 p-4 sm:flex-row sm:items-center sm:p-5">
          {/* Photo Preview */}
          <div className="flex shrink-0 flex-col items-center gap-2 sm:items-start">
            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted shadow-sm">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Mechanic profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-[10px]">No photo</span>
                </div>
              )}

              {isUploadingProfilePhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/75">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              )}
            </div>

            {profilePhotoUrl && !isUploadingProfilePhoto && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                <CheckCircle2 className="h-3 w-3" />
                Preview ready
              </span>
            )}
          </div>

          {/* Upload Controls */}
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <Label
                htmlFor="profilePhoto"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Camera className="h-4 w-4 text-primary" />
                Choose Profile Photo
              </Label>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Use a clear, front-facing photo for your mechanic profile.
              </p>
            </div>

            {/* Custom Upload Area */}
            <div
              className={`rounded-lg border border-dashed border-border bg-card transition-colors ${
                isUploadingProfilePhoto
                  ? "cursor-not-allowed opacity-60"
                  : "hover:border-primary/70 hover:bg-muted/40"
              }`}
            >
              <Input
                id="profilePhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploadingProfilePhoto}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];

                  if (file) {
                    const allowedTypes = [
                      "image/jpeg",
                      "image/png",
                      "image/webp",
                    ];

                    if (allowedTypes.includes(file.type)) {
                      onProfilePhotoUpload(file);
                    }
                  }

                  event.currentTarget.value = "";
                }}
                className="sr-only"
              />

              <Label
                htmlFor="profilePhoto"
                className={`flex min-h-[76px] items-center gap-3 p-3 ${
                  isUploadingProfilePhoto
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                  {isUploadingProfilePhoto ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-5 w-5 text-primary" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    {isUploadingProfilePhoto
                      ? "Uploading your photo..."
                      : profilePhotoUrl
                        ? "Choose another photo"
                        : "Click to choose an image"}
                  </p>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    JPG, PNG or WebP · Maximum 5 MB
                  </p>
                </div>

                {!isUploadingProfilePhoto && (
                  <span className="shrink-0 rounded-md bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground">
                    Browse
                  </span>
                )}
              </Label>
            </div>

            {/* Upload Status */}
            {isUploadingProfilePhoto && (
              <p
                role="status"
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Please wait while your photo is uploaded.
              </p>
            )}

            {data.profilePhotoKey &&
              profilePhotoUrl &&
              !isUploadingProfilePhoto && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Profile photo uploaded successfully.
                </p>
              )}

            {errors.profilePhotoKey && (
              <p role="alert" className="text-xs text-destructive">
                {errors.profilePhotoKey}
              </p>
            )}

            {/* Remove Photo */}
        {profilePhotoUrl && !isUploadingProfilePhoto && (
  <button
    type="button"
    onClick={handleRemovePhoto}
    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    <Trash2 className="h-3.5 w-3.5" />
    Remove Photo
  </button>
)}

            <p className="text-[11px] leading-5 text-muted-foreground">
              Your photo will be displayed on your mechanic profile.
            </p>
          </div>
        </div>
      </section>

      {/* Service Location */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-3">
          <h3 className="text-base font-bold text-foreground">
            Service Location
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Enter your service location so RoadAssist can find nearby customers
            and calculate your service coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Service Address */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label
              htmlFor="serviceAddress"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground"
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Service Address *
            </Label>

            <Input
              id="serviceAddress"
              value={data.serviceAddress ?? ""}
              onChange={(event) =>
                onChange({ serviceAddress: event.target.value })
              }
              placeholder="House number, street, locality"
              aria-invalid={Boolean(errors.serviceAddress)}
              className={`h-11 border-border bg-input text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                errors.serviceAddress
                  ? "border-destructive ring-1 ring-destructive"
                  : ""
              }`}
            />

            {errors.serviceAddress && (
              <p role="alert" className="text-[11px] text-destructive">
                {errors.serviceAddress}
              </p>
            )}
          </div>

          {/* Pincode */}
          <div className="space-y-1.5">
            <Label
              htmlFor="pincode"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground"
            >
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              Pincode *
            </Label>

            <Input
              id="pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              value={data.pincode ?? ""}
              onChange={(event) =>
                onChange({
                  pincode: event.target.value.replace(/\D/g, "").slice(0, 6),
                })
              }
              placeholder="6-digit pincode"
              aria-invalid={Boolean(errors.pincode)}
              className={`h-11 border-border bg-input font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                errors.pincode
                  ? "border-destructive ring-1 ring-destructive"
                  : ""
              }`}
            />

            {errors.pincode && (
              <p role="alert" className="text-[11px] text-destructive">
                {errors.pincode}
              </p>
            )}
          </div>

          {/* Service Radius */}
          <div className="space-y-1.5">
            <Label
              htmlFor="serviceRadiusKm"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground"
            >
              <LocateFixed className="h-3.5 w-3.5 text-muted-foreground" />
              Service Radius (km) *
            </Label>

            <Input
              id="serviceRadiusKm"
              type="number"
              min={1}
              max={100}
              value={data.serviceRadiusKm ?? 5}
              onChange={(event) => {
                const value = event.target.value;

                onChange({
                  serviceRadiusKm:
                    value === "" ? undefined : Number(value),
                });
              }}
              aria-invalid={Boolean(errors.serviceRadiusKm)}
              className={`h-11 border-border bg-input text-xs text-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                errors.serviceRadiusKm
                  ? "border-destructive ring-1 ring-destructive"
                  : ""
              }`}
            />

            {errors.serviceRadiusKm && (
              <p role="alert" className="text-[11px] text-destructive">
                {errors.serviceRadiusKm}
              </p>
            )}
          </div>

          {/* Workshop Information */}
          {(data.serviceModel === "workshop" ||
            data.serviceModel === "both") && (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label
                  htmlFor="workshopName"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Workshop Name *
                </Label>

                <Input
                  id="workshopName"
                  value={data.workshopName ?? ""}
                  onChange={(event) =>
                    onChange({ workshopName: event.target.value })
                  }
                  placeholder="Enter your workshop name"
                  aria-invalid={Boolean(errors.workshopName)}
                  className={`h-11 border-border bg-input text-xs text-foreground placeholder:text-muted-foreground ${
                    errors.workshopName
                      ? "border-destructive ring-1 ring-destructive"
                      : ""
                  }`}
                />

                {errors.workshopName && (
                  <p role="alert" className="text-[11px] text-destructive">
                    {errors.workshopName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label
                  htmlFor="workshopAddress"
                  className="text-xs font-medium text-foreground"
                >
                  Workshop Address *
                </Label>

                <Input
                  id="workshopAddress"
                  value={data.workshopAddress ?? ""}
                  onChange={(event) =>
                    onChange({ workshopAddress: event.target.value })
                  }
                  placeholder="Enter your workshop's full address"
                  aria-invalid={Boolean(errors.workshopAddress)}
                  className={`h-11 border-border bg-input text-xs text-foreground placeholder:text-muted-foreground ${
                    errors.workshopAddress
                      ? "border-destructive ring-1 ring-destructive"
                      : ""
                  }`}
                />

                {errors.workshopAddress && (
                  <p role="alert" className="text-[11px] text-destructive">
                    {errors.workshopAddress}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
