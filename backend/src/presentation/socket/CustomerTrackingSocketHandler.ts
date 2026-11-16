
import type { Socket } from "socket.io";
import { IJoinEmergencyTrackingUseCase } from "../../application/interfaces/IJoinEmergencytrackingUseCase.js";


export class CustomerTrackingSocketHandler {

    constructor(
        private readonly joinEmergencyTrackingUseCase: IJoinEmergencyTrackingUseCase
    ) {}

    register(socket: Socket): void {

        socket.on(
            "join_emergency_tracking",
            async (data: { requestId: string }) => {

                try {
                    const userId = socket.data.userId;
                    const activeRole = socket.data.activeRole;

                    if (activeRole !== "user") {
                        throw new Error("Customer access required");
                    }

                    if (!data || typeof data.requestId !== "string" || !data.requestId.trim()) {
                        throw new Error("Valid request ID is required");
                    }

                    await this.joinEmergencyTrackingUseCase.execute(
                        data.requestId,
                        userId
                    );

                    // Join only after authorization succeeds.
                    const room = `emergency-tracking:${data.requestId}`;

                    await socket.join(room);

                    socket.emit("emergency_tracking_joined", {
                        requestId: data.requestId,
                        message: "Successfully joined emergency tracking"
                    });

                    console.log(
                        `Customer ${userId} joined tracking room: ${room}`
                    );

                } catch (error) {

                    socket.emit("emergency_tracking_error", {
                        message: error instanceof Error
                            ? error.message
                            : "Unable to join emergency tracking"
                    });

                }
            }
        );
    }
}
