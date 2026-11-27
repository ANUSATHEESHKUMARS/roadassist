import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock,
    Info,
    Loader2,
    MapPin,
    Save,
    XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast/ToastProvider";

import { ServiceModelSelector } from "@/components/mechanic/ServiceModelSelector";
import { WorkshopServiceFields } from "@/components/mechanic/WorkshopServiceFields";

import { mechanicServiceLocationService } from "@/services/mechanic/mechaniclocationservice";
import type {
    MechanicServiceModel,
    UpdateMechanicServiceLocationDto,
} from "@/types/mechanic/mechanicapplication";
import { MobileServiceFields } from "@/components/mechanic/MobileServiceFields";
import {
    getApplicationStatusInfo,
    type ApplicationStatusInfo,
} from "@/utils/mechanicApplicationStatus";

interface LocationForm {
    serviceModel: MechanicServiceModel;
    serviceAddress: string;
    pincode: string;
    latitude: string;
    longitude: string;
    serviceRadiusKm: string;
    workshopName: string;
    workshopAddress: string;
}

const initialForm: LocationForm = {
    serviceModel: "mobile",
    serviceAddress: "",
    pincode: "",
    latitude: "",
    longitude: "",
    serviceRadiusKm: "10",
    workshopName: "",
    workshopAddress: "",
};

const VARIANT_STYLES: Record<
    ApplicationStatusInfo["variant"],
    { border: string; bg: string; text: string; icon: React.ReactNode }
> = {
    info: {
        border: "border-blue-300/50",
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: <Info className="h-4 w-4 shrink-0 mt-0.5" />,
    },
    warning: {
        border: "border-yellow-300/50",
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        icon: <Clock className="h-4 w-4 shrink-0 mt-0.5" />,
    },
    success: {
        border: "border-green-300/50",
        bg: "bg-green-50",
        text: "text-green-700",
        icon: <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />,
    },
    destructive: {
        border: "border-destructive/30",
        bg: "bg-destructive/10",
        text: "text-destructive",
        icon: <XCircle className="h-4 w-4 shrink-0 mt-0.5" />,
    },
};

function StatusBanner({ statusInfo }: { statusInfo: ApplicationStatusInfo }) {
    const style = VARIANT_STYLES[statusInfo.variant];

    return (
        <div
            role="status"
            className={`rounded-xl border ${style.border} ${style.bg} p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs ${style.text}`}
        >
            <div className="flex items-start gap-2.5">
                {style.icon}
                <div>
                    <span className="font-semibold">{statusInfo.label}</span>
                    <span className="mx-1">—</span>
                    <span>{statusInfo.message}</span>
                </div>
            </div>

            {statusInfo.showOnboardingLink && (
                <Link to="/mechanic/onboarding" className="shrink-0">
                    <Button type="button" size="sm" variant="outline">
                        Go to Onboarding
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                </Link>
            )}
        </div>
    );
}

export const MechanicServiceLocationPage = () => {

    const { showToast } = useToast();

    const [form, setForm] = useState<LocationForm>(initialForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locating, setLocating] = useState(false);
    const [hasApplication, setHasApplication] = useState<boolean>(false);
    const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
    const [statusInfo, setStatusInfo] = useState<ApplicationStatusInfo | null>(null);
    const [applicationError, setApplicationError] = useState<string | null>(null);

    // Load existing mechanic application details once on mount (StrictMode-safe).
    useEffect(() => {
        let cancelled = false;

        const loadApplication = async () => {
            try {
                const application =
                    await mechanicServiceLocationService.getMyApplication();

                if (cancelled) return;

                if (!application) {
                    setHasApplication(false);
                    setApplicationStatus(null);
                    setStatusInfo(null);
                    setApplicationError(
                        "No mechanic application found for your account. Complete mechanic onboarding to create your application before setting a service location."
                    );
                    return;
                }

                setHasApplication(true);
                setApplicationStatus(application.status);

                const info = getApplicationStatusInfo(
                    application.status,
                    application.reviewReason
                );
                setStatusInfo(info);
                setApplicationError(null);

                setForm({
                    serviceModel: application.serviceModel ?? "mobile",
                    serviceAddress: application.serviceAddress ?? "",
                    pincode: application.pincode ?? "",
                    latitude:
                        application.latitude !== undefined
                            ? String(application.latitude)
                            : "",
                    longitude:
                        application.longitude !== undefined
                            ? String(application.longitude)
                            : "",
                    serviceRadiusKm:
                        application.serviceRadiusKm !== undefined
                            ? String(application.serviceRadiusKm)
                            : "10",
                    workshopName: application.workshopName ?? "",
                    workshopAddress: application.workshopAddress ?? "",
                });
            } catch (error) {
                if (cancelled) return;

                const message = axios.isAxiosError(error)
                    ? error.response?.data?.message
                    : error instanceof Error
                      ? error.message
                      : undefined;

                const resolvedMessage =
                    message || "Unable to load mechanic application";
                setHasApplication(false);
                setApplicationError(resolvedMessage);
                showToast(resolvedMessage, "error");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadApplication();

        return () => {
            cancelled = true;
        };
    }, [showToast]);

    const handleServiceModelChange = (
        serviceModel: MechanicServiceModel
    ) => {

        setForm((previous) => ({
            ...previous,
            serviceModel,
        }));
    };

    const handleMobileFieldChange = (
        field:
            | "serviceAddress"
            | "pincode"
            | "latitude"
            | "longitude"
            | "serviceRadiusKm",
        value: string
    ) => {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleWorkshopFieldChange = (
        field: "workshopName" | "workshopAddress",
        value: string
    ) => {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    // Get current GPS coordinates.
    const handleGetCurrentLocation = () => {

        if (!navigator.geolocation) {
            showToast(
                "Geolocation is not supported by this browser",
                "error"
            );
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(

            (position) => {

                setForm((previous) => ({
                    ...previous,
                    latitude: String(position.coords.latitude),
                    longitude: String(position.coords.longitude),
                }));

                setLocating(false);

                showToast(
                    "Current location captured successfully",
                    "success"
                );
            },

            (error) => {

                setLocating(false);

                switch (error.code) {

                    case error.PERMISSION_DENIED:
                        showToast(
                            "Please allow location access in your browser",
                            "error"
                        );
                        break;

                    case error.POSITION_UNAVAILABLE:
                        showToast(
                            "Unable to determine your current location",
                            "error"
                        );
                        break;

                    case error.TIMEOUT:
                        showToast(
                            "Location request timed out. Try again",
                            "error"
                        );
                        break;

                    default:
                        showToast(
                            "Unable to get your current location",
                            "error"
                        );
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };

    const validateForm = (): boolean => {

        const requiresMobile =
            form.serviceModel === "mobile" ||
            form.serviceModel === "both";

        const requiresWorkshop =
            form.serviceModel === "workshop" ||
            form.serviceModel === "both";

        if (requiresMobile) {

            if (!form.serviceAddress.trim()) {
                showToast("Enter your service address", "error");
                return false;
            }

            if (
                !/^\d{6}$/.test(form.pincode)
            ) {
                showToast("Enter a valid 6-digit pincode", "error");
                return false;
            }

            const latitude = Number(form.latitude);
            const longitude = Number(form.longitude);
            const radius = Number(form.serviceRadiusKm);

            if (
                !form.latitude ||
                !form.longitude ||
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                showToast(
                    "Please capture a valid GPS location",
                    "error"
                );
                return false;
            }

            if (
                !form.serviceRadiusKm ||
                !Number.isFinite(radius) ||
                radius < 0.1 ||
                radius > 100
            ) {
                showToast(
                    "Service radius must be between 0.1 and 100 KM",
                    "error"
                );
                return false;
            }
        }

        if (requiresWorkshop) {
            if (!form.workshopName.trim()) {
                showToast("Enter your workshop name", "error");
                return false;
            }

            if (!form.workshopAddress.trim()) {
                showToast("Enter your workshop address", "error");
                return false;
            }
        }

        return true;
    };

    const handleSave = async () => {
        if (saving || locating) return;

        if (!hasApplication) {
            showToast(
                "Please complete mechanic onboarding first to create your application.",
                "error"
            );
            return;
        }

        if (!statusInfo?.canEditServiceLocation) {
            showToast(
                "Only approved mechanics can update their service location",
                "error"
            );
            return;
        }

        if (!validateForm()) return;

        const requiresMobile =
            form.serviceModel === "mobile" ||
            form.serviceModel === "both";

        const requiresWorkshop =
            form.serviceModel === "workshop" ||
            form.serviceModel === "both";

        const parsedLat = Number(form.latitude);
        const parsedLng = Number(form.longitude);
        const parsedRadius = Number(form.serviceRadiusKm);

        const payload: UpdateMechanicServiceLocationDto = {
            serviceModel: form.serviceModel,

            ...(requiresMobile && {
                serviceAddress: form.serviceAddress.trim(),
                pincode: form.pincode.trim(),
                latitude: parsedLat,
                longitude: parsedLng,
                serviceRadiusKm: parsedRadius,
            }),

            ...(!requiresMobile &&
                form.latitude.trim() !== "" &&
                form.longitude.trim() !== "" &&
                Number.isFinite(parsedLat) &&
                Number.isFinite(parsedLng) && {
                    latitude: parsedLat,
                    longitude: parsedLng,
                }),

            ...(!requiresMobile &&
                form.serviceRadiusKm.trim() !== "" &&
                Number.isFinite(parsedRadius) && {
                    serviceRadiusKm: parsedRadius,
                }),

            ...(requiresWorkshop && {
                workshopName: form.workshopName.trim(),
                workshopAddress: form.workshopAddress.trim(),
            }),
        };

        setSaving(true);

        try {
            const updatedApplication =
                await mechanicServiceLocationService.updateServiceLocation(
                    payload
                );

            setHasApplication(true);
            setApplicationStatus(updatedApplication.status);
            setStatusInfo(
                getApplicationStatusInfo(
                    updatedApplication.status,
                    updatedApplication.reviewReason
                )
            );
            setApplicationError(null);

            setForm((previous) => ({
                ...previous,
                serviceModel:
                    updatedApplication.serviceModel ?? previous.serviceModel,
                serviceAddress:
                    updatedApplication.serviceAddress ?? "",
                pincode: updatedApplication.pincode ?? "",
                latitude:
                    updatedApplication.latitude !== undefined
                        ? String(updatedApplication.latitude)
                        : "",
                longitude:
                    updatedApplication.longitude !== undefined
                        ? String(updatedApplication.longitude)
                        : "",
                serviceRadiusKm:
                    updatedApplication.serviceRadiusKm !== undefined
                        ? String(updatedApplication.serviceRadiusKm)
                        : "10",
                workshopName: updatedApplication.workshopName ?? "",
                workshopAddress: updatedApplication.workshopAddress ?? "",
            }));

            showToast(
                "Service location updated successfully",
                "success"
            );
        } catch (error) {
            const responseData = axios.isAxiosError(error)
                ? (error.response?.data as { message?: string } | undefined)
                : undefined;

            const message =
                responseData?.message ||
                (error instanceof Error ? error.message : undefined) ||
                "Unable to update service location";

            showToast(message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {

        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const requiresMobile =
        form.serviceModel === "mobile" ||
        form.serviceModel === "both";

    const requiresWorkshop =
        form.serviceModel === "workshop" ||
        form.serviceModel === "both";

    return (

        <div className="mx-auto max-w-6xl space-y-6">

            {/* Page heading */}
            <div>
                <div className="flex items-center gap-2">

                    <MapPin className="h-6 w-6 text-primary" />

                    <h1 className="text-2xl font-bold tracking-tight">
                        Service Location
                    </h1>

                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                    Configure where and how you provide vehicle assistance.
                </p>
            </div>

            {applicationError && (
                <div
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-destructive"
                >
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{applicationError}</span>
                    </div>

                    <Link to="/mechanic/onboarding" className="shrink-0">
                        <Button type="button" size="sm" variant="outline">
                            Go to Onboarding
                            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                    </Link>
                </div>
            )}

            {statusInfo && !applicationError && (
                <StatusBanner statusInfo={statusInfo} />
            )}

            {/* Service model */}
            <Card>
                <CardContent className="space-y-5 p-6">

                    <div>
                        <h2 className="text-lg font-semibold">
                            Select Service Model
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Choose how you want to provide your services.
                        </p>
                    </div>

                    <ServiceModelSelector
                        value={form.serviceModel}
                        onChange={handleServiceModelChange}
                    />

                </CardContent>
            </Card>

            {/* Mobile service details */}
            {requiresMobile && (

                <MobileServiceFields
                    serviceAddress={form.serviceAddress}
                    pincode={form.pincode}
                    latitude={form.latitude}
                    longitude={form.longitude}
                    serviceRadiusKm={form.serviceRadiusKm}
                    locating={locating}
                    onChange={handleMobileFieldChange}
                    onGetLocation={handleGetCurrentLocation}
                />

            )}

            {/* Workshop details */}
            {requiresWorkshop && (

                <WorkshopServiceFields
                    workshopName={form.workshopName}
                    workshopAddress={form.workshopAddress}
                    onChange={handleWorkshopFieldChange}
                />

            )}

            {/* Save */}
            <div className="flex justify-end">

                <Button
                    onClick={handleSave}
                    disabled={saving || locating || !hasApplication || !statusInfo?.canEditServiceLocation}
                    className="w-full sm:w-auto"
                >

                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}

                    {saving
                        ? "Saving..."
                        : "Save Service Location"}

                </Button>

            </div>

        </div>
    );
};