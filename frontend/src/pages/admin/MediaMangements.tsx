import React, { useState, useRef, useEffect } from "react";

import {
    UploadCloud,
    FileCheck,
    Loader2,
    AlertCircle,
    HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useToast } from "@/components/ui/toast/ToastProvider";

import type { MediaResponse, MediaResponseData, MediaSection } from "@/types/media";

import { deleteMedia, getMedia, uploadMedia } from "@/services/mediaService";

import { MediaPreview } from "@/components/admin/media/MediaPreview";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";


const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
];

const ALL_ALLOWED_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_VIDEO_TYPES,
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;


const SECTION_OPTIONS: {
    label: string;
    value: MediaSection;
}[] = [
        {
            label: "Hero Section",
            value: "hero",
        },
        
        {
            label: "Services Section",
            value: "services",
        },
        {
            label: "Login Background",
            value: "login",
        },
        {
            label: "Register Background",
            value: "register",
        },
        
        {
            label:"premium / Membership",
            value : "membership"
        }

    ];


export default function MediaManagementPage() {

    const [mediaList, setMediaList] = useState<MediaResponseData[]>([])


    const [isLoadingMedia, setisLoadingMedia] = useState(false)

    const { showToast } = useToast();

    const [section, setSection] =
        useState<MediaSection | "">("");

    const [file, setFile] =
        useState<File | null>(null);

    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);

    const [validationError, setValidationError] =
        useState<string | null>(null);

    const [isUploading, setIsUploading] =
        useState<boolean>(false);

    const [isDragging, setIsDragging] =
        useState<boolean>(false);

    const fileInputRef =
        useRef<HTMLInputElement>(null);



    const loadMedia = async () => {
        try {
            const response = await getMedia()

            console.log("Fetched media", response.data)

            setMediaList(response.data)


        } catch (error) {
            console.error('failed to fetch media', error)
            showToast('Failed to load media', "error")
        }
    }
 

    const handleDeleteMedia = async (id : string) => {
        try{
            await deleteMedia(id)

            setMediaList((prev) => 
                prev.filter((media) => media.id !== id)
            )

            showToast("Media deleted successfully", "success")
        }catch(error){
            console.log("failed to delete media" , error)
            showToast("Failed to delete media", "error")
        }
    }

    useEffect(() => {
        loadMedia()
    }, [])
    // Create preview URL
    useEffect(() => {

        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);

        setPreviewUrl(url);

        // Clean up object URL
        return () => {
            URL.revokeObjectURL(url);
        };

    }, [file]);


    // Validate selected file
    const validateAndSetFile = (
        candidateFile: File | null
    ) => {

        setValidationError(null);

        if (!candidateFile) {
            setFile(null);
            return;
        }

        // Validate file type
        if (!ALL_ALLOWED_TYPES.includes(candidateFile.type)) {

            setValidationError(
                "Unsupported file type. Please choose JPG, PNG, WEBP, MP4, or WEBM."
            );

            return;
        }

        // Validate file size
        if (candidateFile.size > MAX_FILE_SIZE_BYTES) {

            setValidationError(
                "File size exceeds the allowed 50MB limit."
            );

            return;
        }

        setFile(candidateFile);
    };


    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const selectedFile =
            e.target.files?.[0] || null;

        validateAndSetFile(selectedFile);
    };


    const handleDrop = (
        e: React.DragEvent<HTMLDivElement>
    ) => {

        e.preventDefault();

        setIsDragging(false);

        if (isUploading) {
            return;
        }

        const droppedFile =
            e.dataTransfer.files?.[0] || null;

        validateAndSetFile(droppedFile);
    };


    const handleDragOver = (
        e: React.DragEvent<HTMLDivElement>
    ) => {

        e.preventDefault();

        if (!isUploading) {
            setIsDragging(true);
        }
    };


    const handleDragLeave = (
        e: React.DragEvent<HTMLDivElement>
    ) => {

        e.preventDefault();

        setIsDragging(false);
    };


    // Clear selected file
    const handleClearSelectedFile = () => {

        setFile(null);

        setValidationError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    // Upload media
    const handleUploadSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        // Validate section
        if (!section) {

            setValidationError(
                "Please select a media section."
            );

            return;
        }

        // Validate file
        if (!file) {

            setValidationError(
                "Please select a media file to upload."
            );

            return;
        }

        setIsUploading(true);

        setValidationError(null);

        try {

            const response =
                await uploadMedia(file, section);

            showToast(
                response.message ||
                "Media uploaded successfully.",
                "success"
            );

            // Reset after successful upload
            handleClearSelectedFile();

            setSection("");

            await loadMedia()

        } catch (error) {

            console.error(
                "Media upload failed:",
                error
            );

            showToast(
                "Failed to upload media. Please try again.",
                "error"
            );

        } finally {

            setIsUploading(false);
        }
    };


    return (
        <div className="space-y-6">

            {/* Page Title */}

            <div>
                <h1 className="text-2xl font-semibold text-foreground">
                    Media Management
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Manage images and videos used across the
                    RoadAssist platform.
                </p>
            </div>


            {/* Main Content */}

            <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-12">


                {/* Upload Configuration */}

                <div className="lg:col-span-7 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6">

                    <form
                        onSubmit={handleUploadSubmit}
                        className="space-y-5"
                    >


                        {/* Media Section */}

                        <div className="space-y-1.5">

                            <Label
                                htmlFor="media-section"
                                className="text-xs font-medium text-foreground"
                            >
                                Media Section{" "}

                                <span className="text-primary">
                                    *
                                </span>
                            </Label>


                            <select
                                id="media-section"
                                value={section}
                                disabled={isUploading}
                                onChange={(e) => {

                                    setSection(
                                        e.target.value as MediaSection
                                    );

                                    if (validationError) {
                                        setValidationError(null);
                                    }

                                }}
                                className="h-10 w-full cursor-pointer rounded-lg border border-border bg-input px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <option
                                    value=""
                                    disabled
                                >
                                    Select destination section...
                                </option>


                                {SECTION_OPTIONS.map(
                                    (option) => (

                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>

                                    )
                                )}

                            </select>


                            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">

                                <HelpCircle className="h-3 w-3" />

                                Specifies where this asset is
                                positioned on the web platform.

                            </p>

                        </div>


                        {/* File Upload */}

                        <div className="space-y-1.5">

                            <Label className="text-xs font-medium text-foreground">

                                Asset File{" "}

                                <span className="text-primary">
                                    *
                                </span>

                            </Label>


                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() =>
                                    !isUploading &&
                                    fileInputRef.current?.click()
                                }
                                className={`
                                    relative
                                    flex
                                    min-h-[180px]
                                    cursor-pointer
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border-2
                                    border-dashed
                                    p-6
                                    text-center
                                    transition-colors

                                    ${isDragging
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-input/50 hover:border-purple-500/60 hover:bg-input"
                                    }

                                    ${isUploading
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                    }
                                `}
                            >

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                    className="hidden"
                                />


                                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-primary shadow-xs">

                                    <UploadCloud className="h-5 w-5" />

                                </div>


                                <p className="text-xs font-semibold text-foreground">
                                    Click to select or drag and drop
                                    media file
                                </p>


                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Supports JPG, PNG, WEBP, MP4,
                                    and WEBM (up to 50MB)
                                </p>


                                {file && (

                                    <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">

                                        <FileCheck className="h-3.5 w-3.5 shrink-0 text-primary" />

                                        <span className="truncate">
                                            Selected: {file.name}
                                        </span>

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* Validation Error */}

                        {validationError && (

                            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-2 text-xs text-rose-400">

                                <AlertCircle className="h-4 w-4 shrink-0" />

                                <span>
                                    {validationError}
                                </span>

                            </div>

                        )}


                        {/* Action Buttons */}

                        <div className="flex flex-col items-center justify-end gap-2.5 border-t border-border pt-2 sm:flex-row">


                            {/* Reset */}

                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    isUploading ||
                                    (!file && !section)
                                }
                                onClick={() => {

                                    handleClearSelectedFile();

                                    setSection("");

                                }}
                                className="h-9 w-full border-border bg-card px-4 text-xs text-foreground hover:bg-muted sm:w-auto"
                            >
                                Reset
                            </Button>


                            {/* Upload */}

                            <Button
                                type="submit"
                                disabled={
                                    isUploading ||
                                    !file ||
                                    !section
                                }
                                className="flex h-9 w-full items-center justify-center gap-2 bg-primary px-5 text-xs font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >

                                {isUploading ? (

                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />

                                        <span>
                                            Uploading...
                                        </span>
                                    </>

                                ) : (

                                    <>
                                        <UploadCloud className="h-3.5 w-3.5" />

                                        <span>
                                            Upload Media
                                        </span>
                                    </>

                                )}

                            </Button>

                        </div>

                    </form>

                </div>


                {/* Preview */}

                <div className="lg:col-span-5">

                    <MediaPreview
                        file={file}
                        previewUrl={previewUrl}
                        onClear={handleClearSelectedFile}
                        disabled={isUploading}
                    />

              
                </div>

            </div>

                  <MediaLibrary
                        mediaList={mediaList}
                        isLoading={isLoadingMedia}
                        onDelete={handleDeleteMedia}
                    />



        </div>
    );
}