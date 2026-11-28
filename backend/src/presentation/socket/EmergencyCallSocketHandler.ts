import crypto from "node:crypto";
import type { Server, Socket } from "socket.io";
import type { IEmergencyRequestRepository } from "../../domain/repositories/IEmergencyRequestRepository.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export type VideoCallStatus =
    | "ringing"
    | "accepted"
    | "declined"
    | "missed"
    | "ended";

interface ActiveCallSession {
    callId: string;
    requestId: string;
    mechanicId: string;
    customerId: string;
    status: VideoCallStatus;
    missedTimer?: ReturnType<typeof setTimeout>;
}

const CALLABLE_REQUEST_STATUSES = new Set([
    "assigned",
    "on_the_way",
    "arrived",
]);

const CALL_RING_TIMEOUT_MS = 45_000;

export class EmergencyCallSocketHandler {
    private readonly activeCallsByRequestId = new Map<string, ActiveCallSession>();
    private readonly activeCallIdByRequestId = new Map<string, string>();

    constructor(
        private readonly io: Server,
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly userRepository?: IUserRepository
    ) {}

    private emitCallError(socket: Socket, requestId: string | undefined, message: string) {
        socket.emit("call:error", {
            ...(requestId ? { requestId } : {}),
            message,
        });
    }

    private cleanupCall(requestId: string) {
        const session = this.activeCallsByRequestId.get(requestId);
        if (session?.missedTimer) {
            clearTimeout(session.missedTimer);
        }
        this.activeCallsByRequestId.delete(requestId);
        this.activeCallIdByRequestId.delete(requestId);
    }

    register(socket: Socket): void {
        const callerId = socket.data.userId as string | undefined;
        const activeRole = socket.data.activeRole as string | undefined;

        socket.on("call:request", async (payload: { requestId?: string }) => {
            const requestId = payload?.requestId?.trim();
            if (!callerId || !requestId) {
                this.emitCallError(socket, requestId, "Invalid call request");
                return;
            }

            if (activeRole !== "mechanic") {
                this.emitCallError(
                    socket,
                    requestId,
                    "Only the assigned mechanic can initiate a video call"
                );
                return;
            }

            try {
                const request =
                    await this.emergencyRequestRepository.findById(requestId);
                if (!request) {
                    this.emitCallError(
                        socket,
                        requestId,
                        "Emergency request not found"
                    );
                    return;
                }

                if (request.assignedMechanicId !== callerId) {
                    this.emitCallError(
                        socket,
                        requestId,
                        "You are not assigned to this emergency request"
                    );
                    return;
                }

                if (!CALLABLE_REQUEST_STATUSES.has(request.status)) {
                    this.emitCallError(
                        socket,
                        requestId,
                        "Video calls are available only after acceptance and before completion"
                    );
                    return;
                }

                const existing = this.activeCallsByRequestId.get(requestId);
                if (
                    existing &&
                    (existing.status === "ringing" ||
                        existing.status === "accepted")
                ) {
                    this.emitCallError(
                        socket,
                        requestId,
                        "A call is already active for this emergency request"
                    );
                    return;
                }

                const callId = crypto.randomUUID();
                const mechanic = this.userRepository
                    ? await this.userRepository.findById(callerId)
                    : null;

                const session: ActiveCallSession = {
                    callId,
                    requestId,
                    mechanicId: callerId,
                    customerId: request.userId,
                    status: "ringing",
                };

                session.missedTimer = setTimeout(() => {
                    const current = this.activeCallsByRequestId.get(requestId);
                    if (!current || current.callId !== callId || current.status !== "ringing") {
                        return;
                    }
                    current.status = "missed";
                    this.io
                        .to(`user:${current.customerId}`)
                        .to(`mechanic:${current.mechanicId}`)
                        .emit("call:missed", {
                            callId,
                            requestId,
                            status: "missed",
                        });
                    this.cleanupCall(requestId);
                }, CALL_RING_TIMEOUT_MS);
                session.missedTimer.unref?.();

                this.activeCallsByRequestId.set(requestId, session);
                this.activeCallIdByRequestId.set(requestId, callId);

                socket.emit("call:ringing", {
                    callId,
                    requestId,
                    status: "ringing",
                });

                this.io.to(`user:${request.userId}`).emit("call:incoming", {
                    callId,
                    requestId,
                    status: "ringing",
                    caller: {
                        mechanicId: callerId,
                        fullName: mechanic?.fullName ?? "Assigned Mechanic",
                    },
                    issueTitle: request.issueTitle,
                });
            } catch {
                this.emitCallError(
                    socket,
                    requestId,
                    "Unable to initiate video call"
                );
            }
        });

        socket.on(
            "call:accept",
            async (payload: { requestId?: string; callId?: string }) => {
                const requestId = payload?.requestId?.trim();
                const callId = payload?.callId?.trim();
                if (!callerId || !requestId || !callId) return;

                const session = this.activeCallsByRequestId.get(requestId);
                if (!session || session.callId !== callId) {
                    this.emitCallError(
                        socket,
                        requestId,
                        "Call session has expired or is no longer ringing"
                    );
                    return;
                }

                if (activeRole !== "user" || session.customerId !== callerId) {
                    this.emitCallError(
                        socket,
                        requestId,
                        "Only the associated customer can accept this call"
                    );
                    return;
                }

                if (session.status !== "ringing") {
                    this.emitCallError(
                        socket,
                        requestId,
                        "Call is no longer awaiting acceptance"
                    );
                    return;
                }

                if (session.missedTimer) {
                    clearTimeout(session.missedTimer);
                    delete session.missedTimer;
                }
                session.status = "accepted";

                this.io.to(`mechanic:${session.mechanicId}`).emit("call:accept", {
                    callId,
                    requestId,
                    status: "accepted",
                    customerId: session.customerId,
                });
            }
        );

        socket.on(
            "call:decline",
            async (payload: { requestId?: string; callId?: string; reason?: string }) => {
                const requestId = payload?.requestId?.trim();
                const callId = payload?.callId?.trim();
                if (!callerId || !requestId || !callId) return;

                const session = this.activeCallsByRequestId.get(requestId);
                if (!session || session.callId !== callId) return;
                if (activeRole !== "user" || session.customerId !== callerId) {
                    this.emitCallError(
                        socket,
                        requestId,
                        "Only the associated customer can decline this call"
                    );
                    return;
                }

                session.status = "declined";
                this.io.to(`mechanic:${session.mechanicId}`).emit("call:decline", {
                    callId,
                    requestId,
                    status: "declined",
                    ...(payload?.reason ? { reason: payload.reason } : {}),
                });
                this.cleanupCall(requestId);
            }
        );

        socket.on(
            "call:offer",
            (payload: { requestId?: string; callId?: string; sdp?: unknown }) => {
                const requestId = payload?.requestId?.trim();
                const callId = payload?.callId?.trim();
                if (!callerId || !requestId || !callId || !payload?.sdp) return;

                const session = this.activeCallsByRequestId.get(requestId);
                if (
                    !session ||
                    session.callId !== callId ||
                    session.status !== "accepted"
                ) {
                    this.emitCallError(socket, requestId, "Call is not active");
                    return;
                }

                if (session.mechanicId !== callerId && session.customerId !== callerId) {
                    this.emitCallError(socket, requestId, "Unauthorized call peer");
                    return;
                }

                const peerRoom =
                    callerId === session.mechanicId
                        ? `user:${session.customerId}`
                        : `mechanic:${session.mechanicId}`;

                this.io.to(peerRoom).emit("call:offer", {
                    callId,
                    requestId,
                    sdp: payload.sdp,
                });
            }
        );

        socket.on(
            "call:answer",
            (payload: { requestId?: string; callId?: string; sdp?: unknown }) => {
                const requestId = payload?.requestId?.trim();
                const callId = payload?.callId?.trim();
                if (!callerId || !requestId || !callId || !payload?.sdp) return;

                const session = this.activeCallsByRequestId.get(requestId);
                if (
                    !session ||
                    session.callId !== callId ||
                    session.status !== "accepted"
                ) {
                    this.emitCallError(socket, requestId, "Call is not active");
                    return;
                }

                if (session.mechanicId !== callerId && session.customerId !== callerId) {
                    this.emitCallError(socket, requestId, "Unauthorized call peer");
                    return;
                }

                const peerRoom =
                    callerId === session.customerId
                        ? `mechanic:${session.mechanicId}`
                        : `user:${session.customerId}`;

                this.io.to(peerRoom).emit("call:answer", {
                    callId,
                    requestId,
                    sdp: payload.sdp,
                });
            }
        );

        socket.on(
            "call:ice-candidate",
            (payload: {
                requestId?: string;
                callId?: string;
                candidate?: unknown;
            }) => {
                const requestId = payload?.requestId?.trim();
                const callId = payload?.callId?.trim();
                if (!callerId || !requestId || !callId || !payload?.candidate) {
                    return;
                }

                const session = this.activeCallsByRequestId.get(requestId);
                if (!session || session.callId !== callId) return;

                if (session.mechanicId !== callerId && session.customerId !== callerId) {
                    return;
                }

                const peerRoom =
                    callerId === session.mechanicId
                        ? `user:${session.customerId}`
                        : `mechanic:${session.mechanicId}`;

                this.io.to(peerRoom).emit("call:ice-candidate", {
                    callId,
                    requestId,
                    candidate: payload.candidate,
                });
            }
        );

        socket.on(
            "call:end",
            (payload: { requestId?: string; callId?: string }) => {
                const requestId = payload?.requestId?.trim();
                if (!callerId || !requestId) return;

                const session = this.activeCallsByRequestId.get(requestId);
                if (!session) return;
                if (payload?.callId && session.callId !== payload.callId) return;
                if (session.mechanicId !== callerId && session.customerId !== callerId) {
                    return;
                }

                session.status = "ended";
                const peerRoom =
                    callerId === session.mechanicId
                        ? `user:${session.customerId}`
                        : `mechanic:${session.mechanicId}`;

                this.io.to(peerRoom).emit("call:end", {
                    callId: session.callId,
                    requestId,
                    status: "ended",
                    endedBy: callerId,
                });
                this.cleanupCall(requestId);
            }
        );

        socket.on("disconnect", () => {
            if (!callerId) return;
            for (const [reqId, session] of this.activeCallsByRequestId.entries()) {
                if (
                    session.mechanicId === callerId ||
                    session.customerId === callerId
                ) {
                    const peerRoom =
                        callerId === session.mechanicId
                            ? `user:${session.customerId}`
                            : `mechanic:${session.mechanicId}`;
                    this.io.to(peerRoom).emit("call:end", {
                        callId: session.callId,
                        requestId: reqId,
                        status: "ended",
                        reason: "peer_disconnected",
                    });
                    this.cleanupCall(reqId);
                }
            }
        });
    }
}
