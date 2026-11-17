
import type { Socket } from "socket.io";
import { IJoinEmergencyTrackingUseCase } from "../../application/interfaces/IJoinEmergencytrackingUseCase.js";
import type { IMechanicLocationStore } from "../../application/interfaces/mechanic/IMechanicLocationStore.js";


export class CustomerTrackingSocketHandler {

    constructor(
        private readonly joinEmergencyTrackingUseCase: IJoinEmergencyTrackingUseCase,
        private readonly mechanicLocationStore: IMechanicLocationStore
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

                    const room = `emergency-tracking:${data.requestId}`;

                    await socket.join(room);

                    socket.emit("emergency_tracking_joined", {
                        requestId: data.requestId,
                        message: "Successfully joined emergency tracking"
                    });

                    console.log(
                        `Customer ${userId} joined tracking room: ${room}`
                    );

                    
                    const latestLocation =
                        await this.mechanicLocationStore.get(data.requestId);

                    if (latestLocation) {
                        socket.emit("mechanic_location_updated", {
                            requestId: latestLocation.requestId,
                            mechanicId: latestLocation.mechanicId,
                            latitude: latestLocation.latitude,
                            longitude: latestLocation.longitude,
                            accuracy: latestLocation.accuracy,
                            heading: latestLocation.heading,
                            speed: latestLocation.speed,
                            updatedAt: latestLocation.updatedAt
                        });

                        console.log(
                            `Sent latest Redis location to customer ${userId} for request ${data.requestId}`
                        );
                    }

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
