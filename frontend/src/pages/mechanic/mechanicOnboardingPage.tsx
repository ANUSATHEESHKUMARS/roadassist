
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import {
    Wrench,
    ArrowRight,
    ArrowLeft,
    Save,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/ToastProvider";

import { OnboardingStepper } from "@/components/mechanic/OnboardingStepper";
import { MechanicPersonalDetailsForm } from "@/components/mechanic/MechanicPersonalDetailsForm";
import { MechanicProfessionalDetailsForm } from "@/components/mechanic/MechanicProfessionalDetails";
import { MechanicDocumentsForm } from "@/components/mechanic/MechanicDocumentsForm";
import { MechanicApplicationReview } from "@/components/mechanic/MechanicApplicationReview";

import type {
    MechanicOnboardingRequest,
} from "@/types/mechanic/mechanicOnboarding";

import {
    saveMechanicDraft,
    submitMechanicApplication,
    uploadMechanicProfilePhoto,
} from "@/services/mechanic/mechanicApplicaitonService";


import type {
  MechanicApplicationStatus,
  MechanicServiceModel,
  SupportedVehicleType,
  MechanicDocumentType,
} from "../../types/mechanic/common";

const INITIAL_DATA: MechanicOnboardingRequest = {
    profilePhotoKey: "",
    experienceYears: 0,
    specialization: [],
    supportedVehicleTypes: [],
    serviceOffered: [],
    professionalDescription: "",
    serviceModel: "mobile",
    serviceAddress: "",
    pincode: "",
    latitude: undefined,
    longitude: undefined,
    serviceRadiusKm: 5,
    workshopName: "",
    workshopAddress: "",
    documents: [],
};

const STEPS = [
    { id: 1, title: "Location", description: "Service Address" },
    { id: 2, title: "Specialization", description: "Trade & Experience" },
    { id: 3, title: "Documents", description: "Licenses & Proofs" },
    { id: 4, title: "Review", description: "Submit Verification" },
];

type ValidationErrors = Record<string, string>;

export default function MechanicOnboardingPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [currentStep, setCurrentStep] = useState(1);


    const [formData, setFormData] =
        useState<MechanicOnboardingRequest>(INITIAL_DATA);

    const [errors, setErrors] = useState<ValidationErrors>({});

    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

    const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] =
        useState(false);
    const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

    const handleUpdate = (
        fields: Partial<MechanicOnboardingRequest>
    ) => {
        setFormData((previous) => ({
            ...previous,
            ...fields,
        }));

        setErrors((previous) => {
            const next = { ...previous };

            Object.keys(fields).forEach((key) => {
                delete next[key];
            });

            return next;
        });
    };

    const getStepErrors = (step: number): ValidationErrors => {
        const validationErrors: ValidationErrors = {};

        if (step === 1) {
            if (!formData.serviceAddress?.trim()) {
                validationErrors.serviceAddress =
                    "Service address is required.";
            }

            const pincode = formData.pincode?.trim() ?? "";

            if (!pincode) {
                validationErrors.pincode = "Pincode is required.";
            } else if (!/^\d{6}$/.test(pincode)) {
                validationErrors.pincode =
                    "Enter a valid 6-digit Indian pincode.";
            }

            if (
                formData.serviceRadiusKm === undefined ||
                !Number.isFinite(formData.serviceRadiusKm) ||
                formData.serviceRadiusKm <= 0
            ) {
                validationErrors.serviceRadiusKm =
                    "Enter a valid service radius.";
            }

            if (
                formData.serviceModel === "workshop" ||
                formData.serviceModel === "both"
            ) {
                if (!formData.workshopName?.trim()) {
                    validationErrors.workshopName =
                        "Workshop name is required.";
                }

                if (!formData.workshopAddress?.trim()) {
                    validationErrors.workshopAddress =
                        "Workshop address is required.";
                }
            }
        }

        if (step === 2) {
            if (formData.specialization.length === 0) {
                validationErrors.specialization =
                    "Select at least one specialization.";
            }

            if (formData.supportedVehicleTypes.length === 0) {
                validationErrors.supportedVehicleTypes =
                    "Select at least one supported vehicle type.";
            }

            if (
                !Number.isFinite(formData.experienceYears) ||
                formData.experienceYears < 0
            ) {
                validationErrors.experienceYears =
                    "Enter a valid experience value.";
            }

            if (formData.serviceOffered.length === 0) {
                validationErrors.serviceOffered =
                    "Select at least one service offered.";
            }
        }

        if (step === 3) {
            const requiredDocumentTypes = [
                "id_proof",
                "mechanic_certificate",
                "trade_license",
            ];

            const uploadedTypes = new Set(
                formData.documents.map((document) => document.documentType)
            );

            const missingDocuments = requiredDocumentTypes.filter(
                (type) => !uploadedTypes.has(type as typeof formData.documents[number]["documentType"])
            );

            if (missingDocuments.length > 0) {
                validationErrors.documents =
                    "Upload your ID proof, mechanic certificate, and trade license.";
            }
        }

        return validationErrors;
    };

    const validateStep = (step: number): boolean => {
        const validationErrors = getStepErrors(step);

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) {
            showToast(
                "Please complete the required fields before continuing.",
                "error"
            );
            return;
        }

        setCurrentStep((previous) => Math.min(previous + 1, 4));

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleBack = () => {
        setCurrentStep((previous) => Math.max(previous - 1, 1));
        setErrors({});

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };
    const handleProfilePhotoUpload = async (file: File) => {
        if (isUploadingProfilePhoto) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast("Profile photo must be smaller than 5 MB.", "error");
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            showToast("Please upload a JPG, PNG, or WebP image.", "error");
            return;
        }

        setIsUploadingProfilePhoto(true);

        try {
            const uploadedFile = await uploadMechanicProfilePhoto(file);

            if (!uploadedFile.fileKey) {
                throw new Error("The server did not return a profile photo key.");
            }

            if (!uploadedFile.fileUrl) {
                console.error("Upload succeeded, but no preview URL was returned.");
                console.error("Uploaded file key:", uploadedFile.fileKey);

                showToast(
                    "Photo uploaded, but the preview URL is missing. Check the backend response.",
                    "error"
                );
                return;
            }

            handleUpdate({
                profilePhotoKey: uploadedFile.fileKey,
            });

            setProfilePhotoUrl(uploadedFile.fileUrl);

            showToast("Profile photo updated successfully.", "success");
        } catch (error: unknown) {
            console.error("Profile photo upload error:", error);

            if (axios.isAxiosError(error)) {
                console.error("Status:", error.response?.status);
                console.error("Backend response:", error.response?.data);
            }

            showToast(
                error instanceof Error
                    ? error.message
                    : "Failed to upload profile photo. Please try again.",
                "error"
            );
        } finally {
            setIsUploadingProfilePhoto(false);
        }
    };
    const handleRemoveProfilePhoto = () => {
    handleUpdate({
        profilePhotoKey: "",
    });

    setProfilePhotoUrl("");
};
    const handleSaveDraft = async () => {
        if (isSavingDraft || isSubmitting || isUploadingProfilePhoto) return;

        try {
            setIsSavingDraft(true);

            const response = await saveMechanicDraft(formData);

            if (!response.success) {
                throw new Error(
                    response.message || "Failed to save draft."
                );
            }

            showToast("Onboarding draft saved successfully.", "success");
        } catch (error: unknown) {
            console.error("Save mechanic draft error:", error);

            if (axios.isAxiosError(error)) {
                console.error("Status:", error.response?.status);
                console.error("Backend response:", error.response?.data);
            }

            showToast(
                error instanceof Error
                    ? error.message
                    : "Failed to save draft. Please try again.",
                "error"
            );
        } finally {
            setIsSavingDraft(false);
        }
    };

   
const handleSubmit = async () => {
    if (isSavingDraft || isSubmitting || isUploadingProfilePhoto) return;

    if (!formData.profilePhotoKey?.trim()) {
        showToast("Please upload your profile photo before submitting.", "error");
        setCurrentStep(4);
        return;
    }

    for (const step of [1, 2, 3]) {
        const stepErrors = getStepErrors(step);

        if (Object.keys(stepErrors).length > 0) {
            setCurrentStep(step);
            setErrors(stepErrors);

            showToast(
                "Please complete all required fields before submitting.",
                "error"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }
    }

    setIsSubmitting(true);

    try {
        console.log("Step 1: Saving mechanic draft...");

        const draftResponse = await saveMechanicDraft(formData);

        console.log("Draft response:", draftResponse);

        if (!draftResponse.success) {
            throw new Error(
                draftResponse.message || "Failed to save the latest draft."
            );
        }

        console.log(
            "Documents in form state:",
            JSON.stringify(formData.documents, null, 2)
        );

        console.log("Step 2: Submitting mechanic application...");

        const submitResponse = await submitMechanicApplication(formData);

        console.log("Submit response:", submitResponse);

        if (!submitResponse.success) {
            throw new Error(
                submitResponse.message || "Application submission failed."
            );
        }

        setIsSubmittedSuccess(true);

        showToast(
            "Your mechanic application was submitted successfully.",
            "success"
        );
    } catch (error: unknown) {
        console.error("Submit mechanic application error:", error);

        if (axios.isAxiosError(error)) {
            console.error("Request URL:", error.config?.url);
            console.error("Status:", error.response?.status);
            console.error(
                "Backend response:",
                JSON.stringify(error.response?.data, null, 2)
            );
        }

        showToast(
            error instanceof Error
                ? error.message
                : "Failed to submit your application. Please try again.",
            "error"
        );
    } finally {
        // Always stop the loading state after the operation settles.
        setIsSubmitting(false);
        console.log("Submission process finished.");
    }
};


    if (isSubmittedSuccess) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
                    <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-7 w-7" />
                    </div>

                    <h2 className="text-xl font-bold tracking-tight">
                        Application Submitted
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your application has been submitted for admin review.
                        You will be notified when its status changes.
                    </p>

                    <Button
                        type="button"
                        onClick={() => navigate("/user/dashboard")}
                        className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
            <div className="w-full max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            <Wrench className="h-4 w-4" />
                        </div>

                        <div>
                            <span className="text-sm font-bold tracking-tight block">
                                RoadAssist
                            </span>

                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                                Mechanic Verification
                            </span>
                        </div>
                    </div>

                    <Link
                        to="/user/dashboard"
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </Link>
                </header>

                {/* Page heading */}
                <section>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Become a RoadAssist Mechanic
                    </h1>

                    <p className="text-sm text-muted-foreground mt-2">
                        Complete your service location, professional details, and
                        verification documents.
                    </p>
                </section>

                {/* Onboarding form */}
                <main className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
                    <OnboardingStepper
                        currentStep={currentStep}
                        steps={STEPS}
                    />

                    <div className="mt-6">
                        {currentStep === 1 && (
  <MechanicPersonalDetailsForm
    data={formData}
    onChange={handleUpdate}
    errors={errors}
    profilePhotoUrl={profilePhotoUrl}
    isUploadingProfilePhoto={isUploadingProfilePhoto}
    onProfilePhotoUpload={handleProfilePhotoUpload}
    onRemoveProfilePhoto={handleRemoveProfilePhoto}
/>
                        )}

                        {currentStep === 2 && (
                            <MechanicProfessionalDetailsForm
                                data={formData}
                                onChange={handleUpdate}
                                errors={errors}
                            />
                        )}

                        {currentStep === 3 && (
                            <MechanicDocumentsForm
                                data={formData}
                                onChange={handleUpdate}
                                errors={errors}
                            />
                        )}

                        {currentStep === 4 && (
                            <MechanicApplicationReview
                                data={formData}
                                onEditStep={(step) => {
                                    setCurrentStep(step);
                                    setErrors({});
                                }}
                            />
                        )}
                    </div>

                    {/* Validation errors */}
                    {Object.keys(errors).length > 0 && (
                        <div
                            role="alert"
                            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span>Please correct the highlighted fields.</span>
                            </div>

                            <ul className="mt-2 ml-6 list-disc space-y-1">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Form actions */}
                    <footer className="mt-8 pt-5 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                isSavingDraft ||
                                isSubmitting ||
                                isUploadingProfilePhoto
                            }
                            onClick={handleSaveDraft}
                            className="w-full sm:w-auto gap-2"
                        >
                            {isSavingDraft ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}

                            {isSavingDraft ? "Saving..." : "Save Draft"}
                        </Button>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        isSavingDraft ||
                                        isSubmitting ||
                                        isUploadingProfilePhoto
                                    }
                                    onClick={handleBack}
                                    className="w-full sm:w-auto gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            )}

                            {currentStep < 4 ? (
                                <Button
                                    type="button"
                                    disabled={
                                        isSavingDraft ||
                                        isSubmitting ||
                                        isUploadingProfilePhoto
                                    }
                                    onClick={handleNext}
                                    className="w-full sm:w-auto gap-2"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    disabled={
                                        isSavingDraft ||
                                        isSubmitting ||
                                        isUploadingProfilePhoto
                                    }
                                    onClick={handleSubmit}
                                    className="w-full sm:w-auto gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Submit Application
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </footer>
                </main>
            </div>

            {/* Page footer */}
            <footer className="mt-8 text-center text-xs text-muted-foreground/60">
                © 2026 RoadAssist Enterprise
            </footer>
        </div>
    );
}