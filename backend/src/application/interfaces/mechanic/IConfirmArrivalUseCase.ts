import type { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";

export interface IConfirmArrivalUseCase {
    execute(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyRequest>;
}

