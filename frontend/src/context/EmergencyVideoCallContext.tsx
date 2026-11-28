import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { emergencyRequestService } from "@/services/EmergencyRequestService";
import { socket } from "@/services/socket/socket";
import {
    VideoCallInterface,
    type VideoCallUiPhase,
} from "@/components/emergency/VideoCallInterface";

interface EmergencyVideoCallContextValue {
    phase: VideoCallUiPhase;
    activeRequestId: string | null;
    startVideoCall: (requestId: string, customerName?: string) => Promise<void>;
    endVideoCall: () => void;
}

const EmergencyVideoCallContext =
    createContext<EmergencyVideoCallContextValue | null>(null);

export function useEmergencyVideoCall() {
    const ctx = useContext(EmergencyVideoCallContext);
    if (!ctx) {
        throw new Error(
            "useEmergencyVideoCall must be used inside EmergencyVideoCallProvider"
        );
    }
    return ctx;
}

const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
    {
        urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
        ],
    },
];

interface ProviderProps {
    role: "mechanic" | "user";
    children: React.ReactNode;
}

export function EmergencyVideoCallProvider({ role, children }: ProviderProps) {
    const { showToast } = useToast();

    const [phase, setPhase] = useState<VideoCallUiPhase>("idle");
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
    const [peerName, setPeerName] = useState("Participant");
    const [issueTitle, setIssueTitle] = useState<string | undefined>();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [hasTurnServer, setHasTurnServer] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const callIdRef = useRef<string | null>(null);
    const requestIdRef = useRef<string | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

    const releaseMediaAndPeer = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);

        if (pcRef.current) {
            pcRef.current.onicecandidate = null;
            pcRef.current.ontrack = null;
            pcRef.current.onconnectionstatechange = null;
            pcRef.current.close();
            pcRef.current = null;
        }

        pendingIceRef.current = [];
        setIsAudioMuted(false);
        setIsVideoMuted(false);
    }, []);

    const acquireMediaStream = useCallback(async (): Promise<MediaStream> => {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error(
                "Camera and microphone access require HTTPS or localhost."
            );
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (err) {
            const name = err instanceof DOMException ? err.name : "";
            if (name === "NotAllowedError" || name === "PermissionDeniedError") {
                throw new Error(
                    "Camera or microphone permission was denied. Please enable device permissions and try again."
                );
            }
            if (name === "NotFoundError") {
                throw new Error(
                    "No camera or microphone hardware was detected on this device."
                );
            }
            throw new Error("Unable to access camera and microphone.");
        }
    }, []);

    const createPeerConnection = useCallback(
        async (requestId: string, callId: string, stream: MediaStream) => {
            let iceServers = FALLBACK_ICE_SERVERS;
            try {
                const cfg = await emergencyRequestService.getRtcIceConfiguration();
                if (Array.isArray(cfg.iceServers) && cfg.iceServers.length > 0) {
                    iceServers = cfg.iceServers;
                }
                setHasTurnServer(Boolean(cfg.hasTurnServer));
            } catch {
                // Keep STUN fallback cleanly
            }

            const pc = new RTCPeerConnection({ iceServers });

            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            pc.ontrack = (event) => {
                const [firstStream] = event.streams;
                if (firstStream) {
                    setRemoteStream(firstStream);
                    setPhase("connected");
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("call:ice-candidate", {
                        requestId,
                        callId,
                        candidate: event.candidate.toJSON(),
                    });
                }
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === "connected") {
                    setPhase("connected");
                } else if (
                    pc.connectionState === "failed" ||
                    pc.connectionState === "disconnected"
                ) {
                    setErrorMessage(
                        "Peer media connection interrupted. Check network or TURN connectivity."
                    );
                }
            };

            pcRef.current = pc;
            return pc;
        },
        []
    );

    const flushPendingIce = useCallback(async (pc: RTCPeerConnection) => {
        if (!pc.remoteDescription) return;
        while (pendingIceRef.current.length > 0) {
            const candidate = pendingIceRef.current.shift();
            if (candidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch {
                    // Ignore late/invalid candidate
                }
            }
        }
    }, []);

    useEffect(() => {
        const handleRinging = (payload: { callId: string; requestId: string }) => {
            callIdRef.current = payload.callId;
            requestIdRef.current = payload.requestId;
            setActiveRequestId(payload.requestId);
            setPhase("ringing_outgoing");
        };

        const handleIncoming = (payload: {
            callId: string;
            requestId: string;
            caller?: { fullName?: string };
            issueTitle?: string;
        }) => {
            if (role !== "user") return;
            callIdRef.current = payload.callId;
            requestIdRef.current = payload.requestId;
            setActiveRequestId(payload.requestId);
            setPeerName(payload.caller?.fullName ?? "Assigned Mechanic");
            setIssueTitle(payload.issueTitle);
            setErrorMessage(null);
            setPhase("ringing_incoming");
        };

        const handleAccepted = async (payload: {
            callId: string;
            requestId: string;
        }) => {
            if (role !== "mechanic") return;
            if (payload.callId !== callIdRef.current) return;

            try {
                setPhase("connecting");
                const stream =
                    localStreamRef.current ?? (await acquireMediaStream());
                const pc = await createPeerConnection(
                    payload.requestId,
                    payload.callId,
                    stream
                );
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("call:offer", {
                    requestId: payload.requestId,
                    callId: payload.callId,
                    sdp: offer,
                });
            } catch (err) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : "Failed to start WebRTC video stream";
                setErrorMessage(msg);
                setPhase("error");
                if (requestIdRef.current && callIdRef.current) {
                    socket.emit("call:end", {
                        requestId: requestIdRef.current,
                        callId: callIdRef.current,
                    });
                }
                releaseMediaAndPeer();
            }
        };

        const handleOffer = async (payload: {
            callId: string;
            requestId: string;
            sdp: RTCSessionDescriptionInit;
        }) => {
            if (payload.callId !== callIdRef.current) return;

            try {
                const stream =
                    localStreamRef.current ?? (await acquireMediaStream());
                const pc =
                    pcRef.current ??
                    (await createPeerConnection(
                        payload.requestId,
                        payload.callId,
                        stream
                    ));

                await pc.setRemoteDescription(
                    new RTCSessionDescription(payload.sdp)
                );
                await flushPendingIce(pc);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("call:answer", {
                    requestId: payload.requestId,
                    callId: payload.callId,
                    sdp: answer,
                });
            } catch (err) {
                setErrorMessage(
                    err instanceof Error
                        ? err.message
                        : "Unable to negotiate incoming video stream"
                );
                setPhase("error");
                releaseMediaAndPeer();
            }
        };

        const handleAnswer = async (payload: {
            callId: string;
            sdp: RTCSessionDescriptionInit;
        }) => {
            if (payload.callId !== callIdRef.current || !pcRef.current) return;
            try {
                await pcRef.current.setRemoteDescription(
                    new RTCSessionDescription(payload.sdp)
                );
                await flushPendingIce(pcRef.current);
            } catch {
                setErrorMessage("Failed to complete WebRTC connection");
                setPhase("error");
                releaseMediaAndPeer();
            }
        };

        const handleIce = async (payload: {
            callId: string;
            candidate: RTCIceCandidateInit;
        }) => {
            if (payload.callId !== callIdRef.current) return;
            if (!pcRef.current || !pcRef.current.remoteDescription) {
                pendingIceRef.current.push(payload.candidate);
                return;
            }
            try {
                await pcRef.current.addIceCandidate(
                    new RTCIceCandidate(payload.candidate)
                );
            } catch {
                // Ignore stale ICE candidate
            }
        };

        const handleDeclined = (payload: { callId: string }) => {
            if (payload.callId !== callIdRef.current) return;
            releaseMediaAndPeer();
            setPhase("declined");
        };

        const handleMissed = (payload: { callId: string }) => {
            if (payload.callId !== callIdRef.current) return;
            releaseMediaAndPeer();
            setPhase("missed");
        };

        const handleEnded = (payload: { callId: string }) => {
            if (callIdRef.current && payload.callId !== callIdRef.current) return;
            releaseMediaAndPeer();
            setPhase("ended");
        };

        const handleCallError = (payload: { message?: string }) => {
            const msg = payload?.message || "Video call failed";
            releaseMediaAndPeer();
            setErrorMessage(msg);
            setPhase("error");
            showToast(msg, "error");
        };

        socket.on("call:ringing", handleRinging);
        socket.on("call:incoming", handleIncoming);
        socket.on("call:accept", handleAccepted);
        socket.on("call:offer", handleOffer);
        socket.on("call:answer", handleAnswer);
        socket.on("call:ice-candidate", handleIce);
        socket.on("call:decline", handleDeclined);
        socket.on("call:missed", handleMissed);
        socket.on("call:end", handleEnded);
        socket.on("call:error", handleCallError);

        return () => {
            socket.off("call:ringing", handleRinging);
            socket.off("call:incoming", handleIncoming);
            socket.off("call:accept", handleAccepted);
            socket.off("call:offer", handleOffer);
            socket.off("call:answer", handleAnswer);
            socket.off("call:ice-candidate", handleIce);
            socket.off("call:decline", handleDeclined);
            socket.off("call:missed", handleMissed);
            socket.off("call:end", handleEnded);
            socket.off("call:error", handleCallError);
        };
    }, [
        role,
        acquireMediaStream,
        createPeerConnection,
        flushPendingIce,
        releaseMediaAndPeer,
        showToast,
    ]);

    useEffect(() => {
        return () => {
            releaseMediaAndPeer();
        };
    }, [releaseMediaAndPeer]);

    const startVideoCall = useCallback(
        async (requestId: string, customerName = "Customer") => {
            if (role !== "mechanic") return;
            if (!socket.connected) {
                socket.connect();
            }

            try {
                setErrorMessage(null);
                setPeerName(customerName);
                requestIdRef.current = requestId;
                setActiveRequestId(requestId);
                await acquireMediaStream();
                setPhase("ringing_outgoing");
                socket.emit("call:request", { requestId });
            } catch (err) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : "Unable to access camera/microphone";
                setErrorMessage(msg);
                setPhase("error");
                showToast(msg, "error");
            }
        },
        [role, acquireMediaStream, showToast]
    );

    const acceptIncomingCall = useCallback(async () => {
        const reqId = requestIdRef.current;
        const callId = callIdRef.current;
        if (!reqId || !callId) return;

        try {
            setErrorMessage(null);
            await acquireMediaStream();
            setPhase("connecting");
            socket.emit("call:accept", { requestId: reqId, callId });
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Unable to access camera/microphone";
            setErrorMessage(msg);
            setPhase("error");
            socket.emit("call:decline", {
                requestId: reqId,
                callId,
                reason: "media_permission_denied",
            });
            releaseMediaAndPeer();
            showToast(msg, "error");
        }
    }, [acquireMediaStream, releaseMediaAndPeer, showToast]);

    const declineIncomingCall = useCallback(() => {
        const reqId = requestIdRef.current;
        const callId = callIdRef.current;
        if (reqId && callId) {
            socket.emit("call:decline", { requestId: reqId, callId });
        }
        releaseMediaAndPeer();
        callIdRef.current = null;
        requestIdRef.current = null;
        setActiveRequestId(null);
        setPhase("idle");
    }, [releaseMediaAndPeer]);

    const endVideoCall = useCallback(() => {
        const reqId = requestIdRef.current;
        const callId = callIdRef.current;
        if (reqId) {
            socket.emit("call:end", {
                requestId: reqId,
                ...(callId ? { callId } : {}),
            });
        }
        releaseMediaAndPeer();
        callIdRef.current = null;
        requestIdRef.current = null;
        setActiveRequestId(null);
        setPhase("idle");
    }, [releaseMediaAndPeer]);

    const toggleAudio = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const nextMuted = !isAudioMuted;
        stream.getAudioTracks().forEach((t) => {
            t.enabled = !nextMuted;
        });
        setIsAudioMuted(nextMuted);
    }, [isAudioMuted]);

    const toggleVideo = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const nextMuted = !isVideoMuted;
        stream.getVideoTracks().forEach((t) => {
            t.enabled = !nextMuted;
        });
        setIsVideoMuted(nextMuted);
    }, [isVideoMuted]);

    const dismissOverlay = useCallback(() => {
        releaseMediaAndPeer();
        callIdRef.current = null;
        requestIdRef.current = null;
        setActiveRequestId(null);
        setErrorMessage(null);
        setPhase("idle");
    }, [releaseMediaAndPeer]);

    return (
        <EmergencyVideoCallContext.Provider
            value={{
                phase,
                activeRequestId,
                startVideoCall,
                endVideoCall,
            }}
        >
            {children}

            <VideoCallInterface
                phase={phase}
                peerName={peerName}
                {...(issueTitle ? { issueTitle } : {})}
                localStream={localStream}
                remoteStream={remoteStream}
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
                hasTurnServer={hasTurnServer}
                errorMessage={errorMessage}
                onAccept={() => void acceptIncomingCall()}
                onDecline={declineIncomingCall}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onEndCall={endVideoCall}
                onDismiss={dismissOverlay}
            />
        </EmergencyVideoCallContext.Provider>
    );
}

