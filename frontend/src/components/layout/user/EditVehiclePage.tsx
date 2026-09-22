import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  ArrowLeft,
  Car,
  Hash,
  Calendar,
  Fuel,
  Palette,
  FileText,
  UploadCloud,
  RefreshCw,
  Save,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type{ Vehicle, VehicleType, FuelType } from "@/types/user/vehicle";
import { getVehicleById, updateVehicle } from "@/services/VehicleService";

interface FormErrors {
  registrationNumber?: string;
  vehicleType?: string;
  brand?: string;
  model?: string;
  year?: string;
  fuelType?: string;
  color?: string;
}

export default function EditVehiclePage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  // Initial Fetch States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  // Form Fields State
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [fuelType, setFuelType] = useState<FuelType>("petrol");
  const [color, setColor] = useState("");

  // Existing file preview URLs from DB
  const [currentVehicleImage, setCurrentVehicleImage] = useState<string | undefined>();
  const [currentInsuranceImage, setCurrentInsuranceImage] = useState<string | undefined>();
  const [currentPucImage, setCurrentPucImage] = useState<string | undefined>();

  // Newly selected File objects
  const [newVehicleImage, setNewVehicleImage] = useState<File | null>(null);
  const [newInsuranceCertificate, setNewInsuranceCertificate] = useState<File | null>(null);
  const [newPucCertificate, setNewPucCertificate] = useState<File | null>(null);

  // Local object URLs for instant previews of replaced files
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(null);
  const [insurancePreview, setInsurancePreview] = useState<string | null>(null);
  const [pucPreview, setPucPreview] = useState<string | null>(null);

  // Input refs for file replacement triggers
  const vehicleImageInputRef = useRef<HTMLInputElement>(null);
  const insuranceInputRef = useRef<HTMLInputElement>(null);
  const pucInputRef = useRef<HTMLInputElement>(null);

  // Submission / Validation States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Load existing vehicle details
  const loadVehicleData = useCallback(async () => {
    if (!vehicleId) {
      setError("No vehicle identifier was supplied in the route.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getVehicleById(vehicleId);
      setVehicle(data);

      // Pre-fill form fields
      setRegistrationNumber(data.registrationNumber || "");
      setVehicleType(data.vehicleType || "car");
      setBrand(data.brand || "");
      setModel(data.model || "");
      setYear(data.year || new Date().getFullYear());
      setFuelType(data.fuelType || "petrol");
      setColor(data.color || "");

      // Retain existing image URLs
      setCurrentVehicleImage(data.vehicleImage);
      setCurrentInsuranceImage(data.insuranceCertificateImage);
      setCurrentPucImage(data.pucCertificateImage);
    } catch {
      setError("Unable to retrieve vehicle information. Please verify your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadVehicleData();
  }, [loadVehicleData]);

  // Handle New File Selections
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required.";
    }
    if (!brand.trim()) {
      newErrors.brand = "Brand/Make is required.";
    }
    if (!model.trim()) {
      newErrors.model = "Model is required.";
    }
    if (!year || year < 1980 || year > new Date().getFullYear() + 1) {
      newErrors.year = `Enter a valid year between 1980 and ${new Date().getFullYear() + 1}.`;
    }
    if (!color.trim()) {
      newErrors.color = "Color is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler (PATCH with multipart/form-data)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !vehicleId) return;

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("registrationNumber", registrationNumber.trim());
      formData.append("vehicleType", vehicleType);
      formData.append("brand", brand.trim());
      formData.append("model", model.trim());
      formData.append("year", year.toString());
      formData.append("fuelType", fuelType);
      formData.append("color", color.trim());

      // Only append new files if the user chose to replace them
      if (newVehicleImage) {
        formData.append("vehicleImage", newVehicleImage);
      }
      if (newInsuranceCertificate) {
        formData.append("insuranceCertificateImage", newInsuranceCertificate);
      }
      if (newPucCertificate) {
        formData.append("pucCertificateImage", newPucCertificate);
      }

      await updateVehicle(vehicleId, formData);
      navigate(`/user/vehicles/${vehicleId}`);
    } catch {
      setError("An error occurred while saving the updates. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  // ================= 1. LOADING SKELETON STATE =================
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 w-52 bg-card border border-border rounded" />
        <div className="space-y-2">
          <div className="h-8 w-44 bg-card border border-border rounded" />
          <div className="h-4 w-96 bg-card border border-border rounded" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted/40 rounded-xl" />
            ))}
          </div>
          <div className="h-px bg-border my-6" />
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted/40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. ERROR STATE =================
  if (error && !vehicle) {
    return (
      <div className="max-w-md mx-auto min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">Unable to Load Vehicle</h2>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <div className="flex items-center gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/user/vehicles")}
            className="h-9 text-xs bg-card border-border hover:bg-muted text-foreground"
          >
            Back to My Vehicles
          </Button>
          <Button
            type="button"
            onClick={loadVehicleData}
            className="h-9 text-xs bg-primary text-primary-foreground hover:opacity-90"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ================= 3. EDIT FORM UI =================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-muted-foreground">
          <Link to="/user/vehicles" className="hover:text-foreground transition-colors font-medium">
            My Vehicles
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
          <Link
            to={`/user/vehicles/${vehicleId}`}
            className="hover:text-foreground transition-colors font-medium"
          >
            Vehicle Details
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
          <span className="font-semibold text-foreground">Edit Vehicle</span>
        </nav>

        <Link
          to={`/user/vehicles/${vehicleId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Vehicle Details</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="pb-2 border-b border-border/60 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Vehicle
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Update your vehicle information and documents to keep your roadside assistance profile accurate.
          </p>
        </div>
        {vehicleId && (
          <span className="text-[11px] font-mono text-muted-foreground bg-secondary/80 border border-border px-2.5 py-1 rounded-md self-start sm:self-auto">
            ID: {vehicleId.slice(-6).toUpperCase()}
          </span>
        )}
      </div>

      {/* Inline Top Warning if Update Failed */}
      {error && (
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 text-xs text-primary">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Vehicle Edit Form Card */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* ================= SECTION 1: CORE VEHICLE INFORMATION ================= */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              <span>Vehicle Information</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update the basic information associated with this vehicle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Registration Number */}
            <div className="space-y-1.5">
              <Label
                htmlFor="registrationNumber"
                className="text-xs font-medium text-foreground flex items-center gap-1"
              >
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Registration Number *</span>
              </Label>
              <Input
                id="registrationNumber"
                type="text"
                value={registrationNumber}
                onChange={(e) => {
                  setRegistrationNumber(e.target.value.toUpperCase());
                  if (errors.registrationNumber) setErrors({ ...errors, registrationNumber: undefined });
                }}
                placeholder="e.g. KL01AB1234"
                className={`h-10 bg-input border-border font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                  errors.registrationNumber ? "border-primary ring-1 ring-primary" : ""
                }`}
              />
              {errors.registrationNumber && (
                <p className="text-[11px] text-primary">{errors.registrationNumber}</p>
              )}
            </div>

            {/* Vehicle Type */}
            <div className="space-y-1.5">
              <Label htmlFor="vehicleType" className="text-xs font-medium text-foreground">
                Vehicle Type *
              </Label>
              <select
                id="vehicleType"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full h-10 rounded-lg border border-border bg-input px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="auto">Auto</option>
                <option value="ev">EV</option>
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <Label htmlFor="brand" className="text-xs font-medium text-foreground">
                Brand / Make *
              </Label>
              <Input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  if (errors.brand) setErrors({ ...errors, brand: undefined });
                }}
                placeholder="e.g. BMW, Toyota, Honda"
                className={`h-10 bg-input border-border text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                  errors.brand ? "border-primary ring-1 ring-primary" : ""
                }`}
              />
              {errors.brand && <p className="text-[11px] text-primary">{errors.brand}</p>}
            </div>

            {/* Model */}
            <div className="space-y-1.5">
              <Label htmlFor="model" className="text-xs font-medium text-foreground">
                Model Name *
              </Label>
              <Input
                id="model"
                type="text"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  if (errors.model) setErrors({ ...errors, model: undefined });
                }}
                placeholder="e.g. 320d, Fortuner, Civic"
                className={`h-10 bg-input border-border text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                  errors.model ? "border-primary ring-1 ring-primary" : ""
                }`}
              />
              {errors.model && <p className="text-[11px] text-primary">{errors.model}</p>}
            </div>

            {/* Manufacturing Year */}
            <div className="space-y-1.5">
              <Label
                htmlFor="year"
                className="text-xs font-medium text-foreground flex items-center gap-1"
              >
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Manufacturing Year *</span>
              </Label>
              <Input
                id="year"
                type="number"
                min={1980}
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  if (errors.year) setErrors({ ...errors, year: undefined });
                }}
                className={`h-10 bg-input border-border text-xs text-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                  errors.year ? "border-primary ring-1 ring-primary" : ""
                }`}
              />
              {errors.year && <p className="text-[11px] text-primary">{errors.year}</p>}
            </div>

            {/* Fuel Type */}
            <div className="space-y-1.5">
              <Label
                htmlFor="fuelType"
                className="text-xs font-medium text-foreground flex items-center gap-1"
              >
                <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Fuel Type *</span>
              </Label>
              <select
                id="fuelType"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full h-10 rounded-lg border border-border bg-input px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary capitalize"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
              </select>
            </div>

            {/* Color */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="color"
                className="text-xs font-medium text-foreground flex items-center gap-1"
              >
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Exterior Color *</span>
              </Label>
              <Input
                id="color"
                type="text"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  if (errors.color) setErrors({ ...errors, color: undefined });
                }}
                placeholder="e.g. Alpine White, Phantom Black"
                className={`h-10 bg-input border-border text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary ${
                  errors.color ? "border-primary ring-1 ring-primary" : ""
                }`}
              />
              {errors.color && <p className="text-[11px] text-primary">{errors.color}</p>}
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="border-t border-border/60" />

        {/* ================= SECTION 2: VEHICLE DOCUMENTS & PHOTOGRAPH ================= */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Vehicle Documents & Photograph</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and update your vehicle documents or photograph when necessary. Existing files remain intact unless replaced.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            
            {/* 1. Vehicle Photograph */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Vehicle Image</span>
                {newVehicleImage ? (
                  <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Replaced
                  </span>
                ) : currentVehicleImage ? (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Current Image
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Not uploaded</span>
                )}
              </div>

              {/* Preview Window */}
              <div className="h-36 w-full rounded-lg bg-input border border-border/80 overflow-hidden relative flex items-center justify-center">
                {vehicleImagePreview || currentVehicleImage ? (
                  <img
                    src={vehicleImagePreview || currentVehicleImage}
                    alt="Vehicle preview"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-1">
                    <Car className="h-8 w-8 stroke-[1.2]" />
                    <span className="text-[10px]">No image uploaded</span>
                  </div>
                )}
              </div>

              {/* Upload Action */}
              <div>
                <input
                  ref={vehicleImageInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) =>
                    handleFileSelect(e, setNewVehicleImage, setVehicleImagePreview)
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => vehicleImageInputRef.current?.click()}
                  className="w-full h-8 text-xs bg-card border-border hover:bg-muted text-foreground flex items-center justify-center gap-1.5"
                >
                  {vehicleImagePreview || currentVehicleImage ? (
                    <>
                      <RefreshCw className="h-3 w-3 text-muted-foreground" />
                      <span>Replace Image</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3 w-3 text-muted-foreground" />
                      <span>Upload Image</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 2. Insurance Certificate */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Insurance Certificate</span>
                {newInsuranceCertificate ? (
                  <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Replaced
                  </span>
                ) : currentInsuranceImage ? (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Current File
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Not uploaded</span>
                )}
              </div>

              {/* Preview Window */}
              <div className="h-36 w-full rounded-lg bg-input border border-border/80 overflow-hidden relative flex items-center justify-center">
                {insurancePreview || currentInsuranceImage ? (
                  <img
                    src={insurancePreview || currentInsuranceImage}
                    alt="Insurance certificate"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-1">
                    <FileText className="h-8 w-8 stroke-[1.2]" />
                    <span className="text-[10px]">No certificate uploaded</span>
                  </div>
                )}
              </div>

              {/* Upload Action */}
              <div>
                <input
                  ref={insuranceInputRef}
                  type="file"
                  accept="image/png, image/jpeg, application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    handleFileSelect(e, setNewInsuranceCertificate, setInsurancePreview)
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => insuranceInputRef.current?.click()}
                  className="w-full h-8 text-xs bg-card border-border hover:bg-muted text-foreground flex items-center justify-center gap-1.5"
                >
                  {insurancePreview || currentInsuranceImage ? (
                    <>
                      <RefreshCw className="h-3 w-3 text-muted-foreground" />
                      <span>Replace Document</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3 w-3 text-muted-foreground" />
                      <span>Upload Document</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 3. PUC Certificate */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">PUC Certificate</span>
                {newPucCertificate ? (
                  <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Replaced
                  </span>
                ) : currentPucImage ? (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Current File
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Not uploaded</span>
                )}
              </div>

              {/* Preview Window */}
              <div className="h-36 w-full rounded-lg bg-input border border-border/80 overflow-hidden relative flex items-center justify-center">
                {pucPreview || currentPucImage ? (
                  <img
                    src={pucPreview || currentPucImage}
                    alt="PUC certificate"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-1">
                    <FileText className="h-8 w-8 stroke-[1.2]" />
                    <span className="text-[10px]">No certificate uploaded</span>
                  </div>
                )}
              </div>

              {/* Upload Action */}
              <div>
                <input
                  ref={pucInputRef}
                  type="file"
                  accept="image/png, image/jpeg, application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    handleFileSelect(e, setNewPucCertificate, setPucPreview)
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => pucInputRef.current?.click()}
                  className="w-full h-8 text-xs bg-card border-border hover:bg-muted text-foreground flex items-center justify-center gap-1.5"
                >
                  {pucPreview || currentPucImage ? (
                    <>
                      <RefreshCw className="h-3 w-3 text-muted-foreground" />
                      <span>Replace Document</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3 w-3 text-muted-foreground" />
                      <span>Upload Document</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>
        </section>

        {/* ================= ACTION AREA ================= */}
        <div className="pt-4 border-t border-border/60 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => navigate(`/user/vehicles/${vehicleId}`)}
            className="w-full sm:w-auto h-10 px-5 text-xs bg-card border-border hover:bg-muted text-foreground transition-colors"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto h-10 px-6 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}