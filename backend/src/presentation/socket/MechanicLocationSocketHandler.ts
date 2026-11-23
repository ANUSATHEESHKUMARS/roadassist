
import type { Server, Socket } from "socket.io";

import type {
    IUpdateMechanicLiveLocationUseCase
} from "../../application/interfaces/mechanic/IUpdateMechanicLiveLocationUseCase.js";

import type {
    MechanicLiveLocationDto
} from "../../application/dtos/mechanic/MechanicLiveLocationDto.js";

export class MechanicLocationSocketHandler {

    constructor(
        private readonly io: Server,
        private readonly updateMechanicLiveLocationUseCase: IUpdateMechanicLiveLocationUseCase
    ) {}

    register(socket: Socket): void {

        socket.on(
            "mechanic_location_update",

            async (data: MechanicLiveLocationDto) => {

                try {

                    const mechanicId = socket.data.userId;

                    if (!mechanicId) {
                        socket.emit("mechanic_location_error", {
                            message: "Authentication required"
                        });
                        return;
                    }

                    if (
                        !data ||
                        typeof data.requestId !== "string" ||
                        !data.requestId.trim() ||
                        !Number.isFinite(data.latitude) ||
                        !Number.isFinite(data.longitude) ||
                        data.latitude < -90 ||
                        data.latitude > 90 ||
                        data.longitude < -180 ||
                        data.longitude > 180
                    ) {
                        socket.emit("mechanic_location_error", {
                            message: "Invalid location data"
                        });
                        return;
                    }

                    const location =
                        await this.updateMechanicLiveLocationUseCase.execute(
                            mechanicId,
                            data
                        );

                    const trackingRoom =
                        `emergency-tracking:${location.requestId}`;

                    this.io.to(trackingRoom).emit(
                        "mechanic_location_updated",
                        {
                            requestId: location.requestId,
                            mechanicId: location.mechanicId,
                            latitude: location.latitude,
                            longitude: location.longitude,
                            accuracy: location.accuracy,
                            heading: location.heading,
                            speed: location.speed,
                            updatedAt: location.updatedAt
                        }
                    );

                    socket.emit("mechanic_location_saved", {
                        requestId: location.requestId,
                        updatedAt: location.updatedAt
                    });

                } catch (error) {

                    console.error(
                        "Mechanic location update failed:",
                        error
                    );

                    socket.emit("mechanic_location_error", {
                        message: error instanceof Error
                            ? error.message
                            : "Unable to update mechanic location"
                    });
                }
            }
        );
    }
}
