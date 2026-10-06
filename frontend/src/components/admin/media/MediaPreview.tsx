import { Image, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaPreviewProps {
    file: File | null;
    previewUrl: string | null;
    onClear: () => void;
    disabled?: boolean;
}

export const MediaPreview = ({
    file,
    previewUrl,
    onClear,
    disabled = false,
}: MediaPreviewProps) => {

    if (!file || !previewUrl) {
        return (
            <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card p-6">
                <div className="text-center">

                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                        <Image className="h-5 w-5" />
                    </div>

                    <p className="text-sm font-medium text-foreground">
                        Media Preview
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Select an image or video to preview it here.
                    </p>

                </div>
            </div>
        );
    }

    const isVideo = file.type.startsWith("video/");

    return (
        <div className="rounded-xl border border-border bg-card p-5">

            <div className="mb-4 flex items-center justify-between">

                <div>
                    <h3 className="text-sm font-semibold text-foreground">
                        Preview
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Preview before uploading
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled}
                    onClick={onClear}
                    className="h-8 w-8"
                    aria-label="Remove selected media"
                >
                    <X className="h-4 w-4" />
                </Button>

            </div>


            {/* Media */}

            <div className="overflow-hidden rounded-lg border border-border bg-black/20">

                {isVideo ? (

                    <video
                        src={previewUrl}
                        controls
                        className="max-h-[350px] w-full object-contain"
                    />

                ) : (

                    <img
                        src={previewUrl}
                        alt={file.name}
                        className="max-h-[350px] w-full object-contain"
                    />

                )}

            </div>


            {/* File Information */}

            <div className="mt-4 space-y-2">

                <div className="flex items-center gap-2">

                    {isVideo ? (
                        <Video className="h-4 w-4 text-primary" />
                    ) : (
                        <Image className="h-4 w-4 text-primary" />
                    )}

                    <p className="truncate text-xs font-medium text-foreground">
                        {file.name}
                    </p>

                </div>

                <p className="text-[11px] text-muted-foreground">
                    Type: {file.type}
                </p>

                <p className="text-[11px] text-muted-foreground">
                    Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>

            </div>

        </div>
    );
};