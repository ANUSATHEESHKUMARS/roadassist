import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Car,
    Calendar,
    Fuel,
    Palette,
    Tag,
    Hash,
    FileText,
    ExternalLink,
    Edit3,
    Trash2,
    AlertTriangle,
    ChevronRight,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/types/user/vehicle";
import { deleteVehicle, getVehicleById } from "@/services/VehicleService";
import { DeleteVehicleDialog } from "@/components/vehicle/VehicleDelete";

export default function VehicleDetailsPage() {
    const { vehicleId } = useParams<{ vehicleId: string }>();
    const navigate = useNavigate();
    
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!vehicleId) {
            return
        }
        try {
            setIsDeleting(true)

            await deleteVehicle(vehicleId);

            navigate('/user/vehicles')



        } catch (error) {
            console.error("failed to delete vehicle", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const fetchVehicle = useCallback(async () => {
        if (!vehicleId) {
            setError("No vehicle identifier provided.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getVehicleById(vehicleId);
            setVehicle(data);
        } catch {
            setError("Unable to load vehicle details. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [vehicleId]);

    useEffect(() => {
        fetchVehicle();
    }, [fetchVehicle]);

    // ================= 1. SKELETON LOADING STATE =================
    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Breadcrumb Skeleton */}
                <div className="h-4 w-48 bg-muted rounded" />

                {/* Page Header Skeleton */}
                <div className="flex justify-between items-center pb-2">
                    <div className="space-y-2">
                        <div className="h-7 w-48 bg-muted rounded" />
                        <div className="h-4 w-80 bg-muted rounded" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 w-24 bg-muted rounded" />
                        <div className="h-9 w-24 bg-muted rounded" />
                    </div>
                </div>

                {/* Hero Card Skeleton */}
                <div className="bg-card border border-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-5 h-64 bg-muted rounded-xl" />
                    <div className="md:col-span-7 space-y-4">
                        <div className="h-8 w-64 bg-muted rounded" />
                        <div className="h-10 w-48 bg-muted rounded" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            <div className="h-14 bg-muted rounded" />
                            <div className="h-14 bg-muted rounded" />
                            <div className="h-14 bg-muted rounded" />
                            <div className="h-14 bg-muted rounded" />
                        </div>
                    </div>
                </div>

                {/* Grid Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-72 bg-card border border-border rounded-2xl p-6" />
                    <div className="h-72 bg-card border border-border rounded-2xl p-6" />
                </div>
            </div>
        );
    }

    // ================= 2. ERROR STATE =================
    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="h-14 w-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                    <AlertTriangle className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-foreground">Failed to Load Vehicle</h2>
                    <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/user/vehicles")}
                        className="h-9 text-xs border-border bg-card hover:bg-muted text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                        Back to My Vehicles
                    </Button>
                    <Button
                        onClick={fetchVehicle}
                        className="h-9 text-xs bg-primary text-primary-foreground hover:opacity-90"
                    >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // ================= 3. NOT FOUND STATE =================
    if (!vehicle) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="h-14 w-14 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                    <Car className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-foreground">Vehicle Not Found</h2>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        The vehicle you are looking for could not be found or has been removed.
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/user/vehicles")}
                    className="h-9 text-xs bg-primary text-primary-foreground hover:opacity-90 mt-2"
                >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Back to My Vehicles
                </Button>
            </div>
        );
    }

    // ================= 4. MAIN VEHICLE DETAILS VIEW =================
    return (
        <div className="space-y-6">
            {/* 1. Breadcrumb: My Vehicles / Vehicle Details */}
            <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                <Link
                    to="/user/vehicles"
                    className="hover:text-foreground transition-colors font-medium"
                >
                    My Vehicles
                </Link>
                <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                <span className="font-semibold text-foreground">Vehicle Details</span>
            </nav>

            {/* 2. Page Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Vehicle Details
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        View and manage your vehicle information and documents.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            console.log("EDIT BUTTON CLICKED");
                            console.log("Vehicle ID:", vehicle.id);

                            navigate(`/vehicles/${vehicleId}/edit`);
                        }}
                        className="h-9 px-4 text-xs font-medium bg-card border-border hover:bg-muted text-foreground transition-colors"
                    >
                        <Edit3 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        Edit Vehicle
                    </Button>
                    <Button
                        type="button"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="h-9 px-4 text-xs font-medium bg-destructive text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete Vehicle
                    </Button>
                </div>
            </div>

            <DeleteVehicleDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                vehicle={vehicle}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
            {/* 3. Vehicle Hero / Main Information Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Vehicle Image / Placeholder */}
                <div className="md:col-span-5 h-60 w-full rounded-xl overflow-hidden bg-secondary border border-border relative flex items-center justify-center">
                    {vehicle.vehicleImage ? (
                        <img
                            src={vehicle.vehicleImage}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover object-center"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                            <Car className="h-16 w-16 stroke-[1.2]" />
                            <span className="text-[11px] uppercase tracking-wider font-mono">
                                No Image Available
                            </span>
                        </div>
                    )}
                </div>

                {/* Hero Specs & Registration Header */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                            <Tag className="h-3.5 w-3.5" />
                            <span>{vehicle.vehicleType}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                            {vehicle.brand} {vehicle.model}
                        </h2>
                    </div>

                    {/* Prominent Registration Number Display */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-secondary border border-border w-fit">
                        <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                            REG NO:
                        </span>
                        <span className="font-mono text-base font-bold text-foreground tracking-wide">
                            {vehicle.registrationNumber}
                        </span>
                    </div>

                    {/* Quick Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/60">
                        <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                Type
                            </span>
                            <p className="text-xs font-bold text-foreground capitalize mt-0.5">
                                {vehicle.vehicleType}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                Year
                            </span>
                            <p className="text-xs font-bold text-foreground mt-0.5">
                                {vehicle.year}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                Fuel
                            </span>
                            <p className="text-xs font-bold text-foreground capitalize mt-0.5">
                                {vehicle.fuelType}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                Color
                            </span>
                            <p className="text-xs font-bold text-foreground capitalize mt-0.5">
                                {vehicle.color}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Vehicle Information & Documents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Detailed Information Card */}
                <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                    <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        <span>Vehicle Information</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Tag className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-[11px] text-muted-foreground">Vehicle Type</span>
                                <p className="text-xs font-semibold text-foreground capitalize">
                                    {vehicle.vehicleType}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Car className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-[11px] text-muted-foreground">Make / Brand</span>
                                <p className="text-xs font-semibold text-foreground">
                                    {vehicle.brand}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Car className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-[11px] text-muted-foreground">Model</span>
                                <p className="text-xs font-semibold text-foreground">
                                    {vehicle.model}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Hash className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-[11px] text-muted-foreground">Registration Number</span>
                                <p className="text-xs font-semibold text-foreground font-mono">
                                    {vehicle.registrationNumber}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-[11px] text-muted-foreground">Manufacturing Year</span>
                                <p className="text-xs font-semibold text-foreground">
                                    {vehicle.year}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Fuel className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-[11px] text-muted-foreground">Fuel Type</span>
                                <p className="text-xs font-semibold text-foreground capitalize">
                                    {vehicle.fuelType}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3 sm:col-span-2">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Palette className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-[11px] text-muted-foreground">Exterior Color</span>
                                <p className="text-xs font-semibold text-foreground capitalize">
                                    {vehicle.color}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Vehicle Documents Section */}
                <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                    <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Vehicle Documents</span>
                    </h3>

                    <div className="space-y-4">
                        {/* 1. Insurance Certificate */}
                        <div className="p-4 rounded-xl bg-secondary/60 border border-border flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary shrink-0">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-semibold text-foreground truncate">
                                        Insurance Certificate
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {vehicle.insuranceCertificateImage
                                            ? "Uploaded and verified"
                                            : "Not Uploaded"}
                                    </p>
                                </div>
                            </div>

                            {vehicle.insuranceCertificateImage ? (
                                <a
                                    href={vehicle.insuranceCertificateImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-8 px-3 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0"
                                >
                                    <span>View</span>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </a>
                            ) : (
                                <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 rounded bg-background/60 border border-border shrink-0">
                                    Not Uploaded
                                </span>
                            )}
                        </div>

                        {/* 2. PUC Certificate */}
                        <div className="p-4 rounded-xl bg-secondary/60 border border-border flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary shrink-0">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-semibold text-foreground truncate">
                                        PUC Certificate
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {vehicle.pucCertificateImage
                                            ? "Uploaded and verified"
                                            : "Not Uploaded"}
                                    </p>
                                </div>
                            </div>

                            {vehicle.pucCertificateImage ? (
                                <a
                                    href={vehicle.pucCertificateImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-8 px-3 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0"
                                >
                                    <span>View</span>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </a>
                            ) : (
                                <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 rounded bg-background/60 border border-border shrink-0">
                                    Not Uploaded
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}