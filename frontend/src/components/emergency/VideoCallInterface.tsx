import { useEffect, useRef } from "react";
import {
    AlertTriangle,
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Video,
    VideoOff,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type VideoCallUiPhase =
    | "idle"
    | "ringing_outgoing"
    | "ringing_incoming"
    | "connecting"
    | "connected"
    | "declined"
    | "missed"
    | "ended"
    | "error";

interface VideoCallInterfaceProps {
    phase: VideoCallUiPhase;
    peerName: string;
    issueTitle?: string;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    hasTurnServer?: boolean;
    errorMessage?: string | null;
    onAccept?: () => void;
    onDecline?: () => void;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onEndCall: () => void;
    onDismiss: () => void;
}

export function VideoCallInterface({
    phase,
    peerName,
    issueTitle,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    hasTurnServer = false,
    errorMessage,
    onAccept,
    onDecline,
    onToggleAudio,
    onToggleVideo,
    onEndCall,
    onDismiss,
}: VideoCallInterfaceProps) {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (phase === "idle") {
        return null;
    }

    if (phase === "ringing_incoming") {
        return (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
                <div className="w-full max-w-sm rounded-2xl border border-primary/40 bg-card p-6 text-foreground shadow-2xl space-y-5">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="flex size-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 animate-pulse">
                            <Video className="size-8" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                                Incoming Emergency Video Call
                            </p>
                            <h3 className="mt-1 text-lg font-bold">
                                {peerName}
                            </h3>
                            {issueTitle && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Regarding: {issueTitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        Accept to discuss your vehicle issue over live video and audio. Calls are never recorded.
                    </p>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onDecline}
                            className="flex-1 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                        >
                            <PhoneOff className="size-4" />
                            Decline
                        </Button>
                        <Button
                            type="button"
                            onClick={onAccept}
                            className="flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            <Phone className="size-4" />
                            Accept Call
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const isTerminal =
        phase === "declined" ||
        phase === "missed" ||
        phase === "ended" ||
        phase === "error";

    const statusLabel: Record<Exclude<VideoCallUiPhase, "idle" | "ringing_incoming">, string> = {
        ringing_outgoing: "Calling peer… Waiting for customer to answer",
        connecting: "Connecting WebRTC media stream…",
        connected: "Connected · Live encrypted peer stream",
        declined: "Call was declined by the customer.",
        missed: "Customer did not answer the call.",
        ended: "Video call ended.",
        error: errorMessage || "Call encountered a connection or device error.",
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                    <div>
                        <p className="text-sm font-bold text-foreground">
                            {peerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {statusLabel[phase]}
                        </p>
                    </div>

                    {isTerminal && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onDismiss}
                        >
                            <X className="size-4" />
                        </Button>
                    )}
                </div>

                {/* Video Stage */}
                <div className="relative flex min-h-[340px] items-center justify-center bg-black sm:min-h-[420px]">
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="h-full max-h-[460px] w-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 p-6 text-center text-muted-foreground">
                            {phase === "error" ? (
                                <AlertTriangle className="size-10 text-destructive" />
                            ) : (
                                <Video className="size-10 text-primary" />
                            )}
                            <p className="max-w-md text-xs">
                                {statusLabel[phase]}
                            </p>
                            {!hasTurnServer && !isTerminal && (
                                <p className="text-[10px] text-muted-foreground/80">
                                    Using STUN signalling. Restrictive mobile/corporate NATs require TURN server credentials in env.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Local Picture-in-Picture */}
                    {localStream && !isTerminal && (
                        <div className="absolute bottom-3 right-3 h-28 w-40 overflow-hidden rounded-xl border border-border bg-zinc-900 shadow-lg">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border bg-card px-5 py-4">
                    {!isTerminal ? (
                        <>
                            <Button
                                type="button"
                                variant={isAudioMuted ? "destructive" : "outline"}
                                size="sm"
                                onClick={onToggleAudio}
                                className="gap-1.5"
                            >
                                {isAudioMuted ? (
                                    <MicOff className="size-4" />
                                ) : (
                                    <Mic className="size-4" />
                                )}
                                {isAudioMuted ? "Unmute Mic" : "Mute Mic"}
                            </Button>

                            <Button
                                type="button"
                                variant={isVideoMuted ? "destructive" : "outline"}
                                size="sm"
                                onClick={onToggleVideo}
                                className="gap-1.5"
                            >
                                {isVideoMuted ? (
                                    <VideoOff className="size-4" />
                                ) : (
                                    <Video className="size-4" />
                                )}
                                {isVideoMuted ? "Camera Off" : "Camera On"}
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={onEndCall}
                                className="gap-1.5"
                            >
                                <PhoneOff className="size-4" />
                                End Call
                            </Button>
                        </>
                    ) : (
                        <Button type="button" onClick={onDismiss}>
                            Close
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

