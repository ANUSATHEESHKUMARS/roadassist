import React from "react";
import { Loader2, Image as ImageIcon, Video as VideoIcon, Calendar, HardDrive } from "lucide-react";
import type { MediaResponseData } from "@/types/media";
import { Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
interface MediaLibraryProps {
    mediaList: MediaResponseData[];
    isLoading?: boolean;
    onDelete: (id: string) => void
}

const formatBytesToMB = (bytes: number): string => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
};

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return dateString;
    }
};

const formatSectionLabel = (section: string): string => {
    return section.charAt(0).toUpperCase() + section.slice(1);
};

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
    mediaList,
    isLoading = false,
    onDelete,
}) => {
    return (
        <section className="space-y-4 pt-4 border-t border-border">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold tracking-tight text-foreground">
                        Uploaded Media
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Assets currently deployed across platform sections.
                    </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                    Total: <strong className="text-foreground">{mediaList.length}</strong>
                </span>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                    <p className="text-xs font-medium text-foreground">Loading media assets...</p>
                </div>
            ) : mediaList.length === 0 ? (
                /* Empty State */
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground mb-3">
                        <ImageIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">No media uploaded</h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                        Uploaded images and videos will appear here once saved to S3.
                    </p>
                </div>
            ) : (
                /* Responsive Media Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {mediaList.map((media) => {
                        const isVideo = media.mediaType === "video";

                        return (
                            <div
                                key={media.id}
                                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-xs hover:border-border/80 transition-colors"
                            >
                                {/* Media Preview Box */}
                                <div className="relative aspect-video w-full bg-background/60 overflow-hidden border-b border-border flex items-center justify-center">
                                    {isVideo ? (
                                        <video
                                            src={media.url}
                                            controls
                                            playsInline
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={media.url}
                                            alt={media.originalName}
                                            loading="lazy"
                                            className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                                        />
                                    )}

                                    {/* Section Badge Floating Overlay */}
                                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase shadow-xs">
                                            {formatSectionLabel(media.section)}
                                        </span>
                                    </div>

                                    {/* Media Type Floating Indicator */}
                                    <div className="absolute top-2.5 right-2.5 pointer-events-none">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-xs border border-border/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                                            {isVideo ? (
                                                <>
                                                    <VideoIcon className="h-3 w-3 text-primary" />
                                                    <span>MP4</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-3 w-3 text-foreground" />
                                                    <span>IMG</span>
                                                </>
                                            )}
                                        </span>


                                    </div>
                                </div>

                                <div className="p-3.5 space-y-2.5">
                                    <div>
                                        <p
                                            className="text-xs font-semibold text-foreground truncate"
                                            title={media.originalName}
                                        >
                                            {media.originalName}
                                        </p>

                                        <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                                            {media.fileKey}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <HardDrive className="h-3 w-3 shrink-0" />
                                            <span>{formatBytesToMB(media.size)}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                            <Calendar className="h-3 w-3 shrink-0" />
                                            <span>{formatDate(media.createdAt)}</span>
                                        </div>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger >
                                            <button
                                                type="button"
                                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </button>
                                        </AlertDialogTrigger>

                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Delete media?
                                                </AlertDialogTitle>

                                                <AlertDialogDescription>
                                                    Are you sure you want to delete{" "}
                                                    <span className="font-medium text-foreground">
                                                        {media.originalName}
                                                    </span>
                                                    ? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>

                                                <AlertDialogAction
                                                    onClick={() => onDelete(media.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};