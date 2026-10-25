
import React from "react";
import { Edit3, CheckCircle2, ShieldAlert } from "lucide-react";

import type {
  MechanicOnboardingRequest,
} from "@/types/mechanic/mechanicOnboarding";

interface ReviewProps {
  data: MechanicOnboardingRequest;
  onEditStep: (step: number) => void;
}

export const MechanicApplicationReview: React.FC<ReviewProps> = ({
  data,
  onEditStep,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-base font-bold text-foreground">
          Review & Submit Application
        </h3>

        <p className="text-xs text-muted-foreground mt-1">
          Carefully verify your professional information and uploaded
          documents before submitting your application for verification.
        </p>
      </div>

      {/* Professional Details */}
      <section className="p-4 rounded-xl bg-secondary/70 border border-border space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            1. Professional Profile
          </span>

          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Service Model
            </span>

            <p className="font-semibold text-foreground mt-1 capitalize">
              {data.serviceModel || "Not specified"}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Experience
            </span>

            <p className="font-mono text-foreground mt-1">
              {data.experienceYears} years
            </p>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Specializations
            </span>

            <p className="text-foreground mt-1 capitalize">
              {data.specialization?.join(", ") || "None selected"}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Supported Vehicle Types
            </span>

            <p className="text-foreground mt-1 capitalize">
              {data.supportedVehicleTypes?.join(", ") || "None selected"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Services Offered
            </span>

            <p className="text-foreground mt-1">
              {data.serviceOffered?.join(", ") || "None selected"}
            </p>
          </div>

          {data.professionalDescription && (
            <div className="sm:col-span-2">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Professional Description
              </span>

              <p className="text-foreground mt-1 whitespace-pre-wrap">
                {data.professionalDescription}
              </p>
            </div>
          )}

          {data.serviceAddress && (
            <div className="sm:col-span-2">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Service Address
              </span>

              <p className="text-foreground mt-1">
                {data.serviceAddress}
              </p>
            </div>
          )}

          {data.serviceRadiusKm !== undefined && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Service Radius
              </span>

              <p className="text-foreground mt-1">
                {data.serviceRadiusKm} km
              </p>
            </div>
          )}

          {data.latitude !== undefined && data.longitude !== undefined && (
            <div className="sm:col-span-2">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                GPS Coordinates
              </span>

              <p className="text-foreground mt-1 font-mono">
                {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {data.workshopName && (
            <div className="sm:col-span-2">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Workshop Name
              </span>

              <p className="text-foreground mt-1">
                {data.workshopName}
              </p>
            </div>
          )}

          {data.workshopAddress && (
            <div className="sm:col-span-2">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Workshop Address
              </span>

              <p className="text-foreground mt-1">
                {data.workshopAddress}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Verification Documents */}
      <section className="p-4 rounded-xl bg-secondary/70 border border-border space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            2. Verification Documents
          </span>

          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </button>
        </div>

        {data.documents.length === 0 ? (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
            No verification documents have been uploaded.
          </p>
        ) : (
          <div className="space-y-2">
            {data.documents.map((doc) => (
              <div
                key={`${doc.documentType}-${doc.fileKey}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs py-2 border-b border-border/40 last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground capitalize">
                    {doc.documentType.replace(/_/g, " ")}
                  </p>

                  <p className="text-muted-foreground break-all mt-1">
                    {doc.originalName}
                  </p>
                </div>

                <span className="font-medium text-emerald-400 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Uploaded
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />

        <p className="text-xs text-muted-foreground leading-relaxed">
          After submission, your application will be reviewed by the
          RoadAssist admin team. Mechanic access is subject to approval.
        </p>
      </div>
    </div>
  );
};
