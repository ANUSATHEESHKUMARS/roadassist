
import React, { useState } from "react";
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";

import type {
  MechanicOnboardingRequest,
  DocumentEntry,
} from "@/types/mechanic/mechanicOnboarding";

import { uploadOnboardingDocument } from "@/services/mechanic/mechanicApplicaitonService";

interface DocumentsProps {
  data: MechanicOnboardingRequest;
  onChange: (fields: Partial<MechanicOnboardingRequest>) => void;
  errors: Record<string, string>;
}

const REQUIRED_DOCS = [
  {
    type: "id_proof" as const,
    title: "Government Identification",
    desc: "Passport, driving licence, or government identity card.",
  },
  {
    type: "mechanic_certificate" as const,
    title: "Mechanic Certificate",
    desc: "Apprenticeship diploma or automotive qualification certificate.",
  },
  {
    type: "trade_license" as const,
    title: "Trade License",
    desc: "Registered trade licence or applicable business permit.",
  },
];

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const MechanicDocumentsForm: React.FC<DocumentsProps> = ({
  data,
  onChange,
  errors,
}) => {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const documents = data.documents ?? [];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: DocumentEntry["documentType"],
  ) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setUploadError(null);

    if (!documentType?.trim()) {
      setUploadError("Please select a valid document type.");
      input.value = "";
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError(
        "Invalid file format. Upload a PDF, PNG, JPG, or WEBP file.",
      );
      input.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Document file exceeds the maximum size of 15 MB.");
      input.value = "";
      return;
    }

    if (file.size === 0) {
      setUploadError(
        "The selected file is empty. Please select another file.",
      );
      input.value = "";
      return;
    }

    try {
      setUploadingType(documentType);

      const uploaded = await uploadOnboardingDocument(file, documentType);

      if (!uploaded.fileKey?.trim()) {
        throw new Error("The server did not return a valid document file key.");
      }

      const newDocument: DocumentEntry = {
        documentType,
        fileKey: uploaded.fileKey,
        originalName: file.name,
        mimeType: file.type,
        fileUrl: uploaded.fileUrl,
        fileSize: file.size,
      };

      const updatedDocuments = [
        ...documents.filter(
          (document) => document.documentType !== documentType,
        ),
        newDocument,
      ];

      console.log("Document added to onboarding form:", newDocument);

      onChange({ documents: updatedDocuments });
    } catch (error: unknown) {
      console.error("Mechanic document upload failed:", error);

      setUploadError(
        error instanceof Error
          ? error.message
          : `Failed to upload ${file.name}. Please try again.`,
      );
    } finally {
      setUploadingType(null);
      input.value = "";
    }
  };

  const removeDocument = (
    documentType: DocumentEntry["documentType"],
  ) => {
    const updatedDocuments = documents.filter(
      (document) => document.documentType !== documentType,
    );

    onChange({ documents: updatedDocuments });
    setUploadError(null);
  };

  const uploadedCount = REQUIRED_DOCS.filter((requiredDocument) =>
    documents.some(
      (document) =>
        document.documentType === requiredDocument.type &&
        Boolean(document.fileKey?.trim()),
    ),
  ).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-base font-bold text-foreground">
          Compliance & Verification
        </h3>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Upload the required documents to verify your mechanic profile.
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          {uploadedCount} of {REQUIRED_DOCS.length} documents uploaded
        </p>
      </div>

      {uploadError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="space-y-4">
        {REQUIRED_DOCS.map((documentDefinition) => {
          const currentDocument = documents.find(
            (document) =>
              document.documentType === documentDefinition.type,
          );

          const isProcessing =
            uploadingType === documentDefinition.type;

          return (
            <div
              key={documentDefinition.type}
              className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-input/40 p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 space-y-1">
                <span className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <span>{documentDefinition.title}</span>
                  <span className="text-primary">*</span>
                </span>

                <p className="text-[11px] text-muted-foreground">
                  {documentDefinition.desc}
                </p>

                {currentDocument && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-500">
                    <FileCheck className="h-3.5 w-3.5 shrink-0" />

                    <span className="break-all font-mono">
                      {currentDocument.originalName}
                      {currentDocument.fileSize !== undefined &&
                        ` (${(
                          currentDocument.fileSize /
                          (1024 * 1024)
                        ).toFixed(2)} MB)`}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {currentDocument ? (
                  <button
                    type="button"
                    disabled={uploadingType !== null}
                    onClick={() =>
                      removeDocument(documentDefinition.type)
                    }
                    className="cursor-pointer rounded-lg bg-secondary p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    title="Remove document"
                    aria-label={`Remove ${documentDefinition.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <label
                    className={`relative inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-medium text-foreground shadow-xs transition-colors ${
                      uploadingType !== null
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:bg-muted"
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="mr-1.5 h-3.5 w-3.5 text-primary" />
                    )}

                    <span>
                      {isProcessing ? "Uploading..." : "Select File"}
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      disabled={uploadingType !== null}
                      onChange={(event) =>
                        handleFileUpload(
                          event,
                          documentDefinition.type,
                        )
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {errors.documents && (
        <p role="alert" className="text-[11px] text-destructive">
          {errors.documents}
        </p>
      )}
    </div>
  );
};
