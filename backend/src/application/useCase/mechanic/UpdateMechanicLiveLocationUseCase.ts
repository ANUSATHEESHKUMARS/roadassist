import type {
    IEmergencyRequestRepository
} from "../../../domain/repositories/IEmergencyRequestRepository.js";

import type {
    IMechanicLocationStore
} from "../../interfaces/mechanic/IMechanicLocationStore.js";

import type {
    MechanicLiveLocationDto,
    StoredMechanicLocation
} from "../../dtos/mechanic/MechanicLiveLocationDto.js"
import { IUpdateMechanicLiveLocationUseCase } from "../../interfaces/mechanic/IUpdateMechanicLiveLocationUseCase.js";

export class UpdateMechanicLiveLocationUseCase  implements IUpdateMechanicLiveLocationUseCase{

    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly mechanicLocationStore: IMechanicLocationStore
    ) {}

    async execute(
        mechanicId: string,
        dto: MechanicLiveLocationDto
    ): Promise<StoredMechanicLocation> {

        if (!mechanicId || !dto.requestId) {
            throw new Error("Mechanic ID and request ID are required");
        }

        if (
            !Number.isFinite(dto.latitude) ||
            !Number.isFinite(dto.longitude) ||
            dto.latitude < -90 ||
            dto.latitude > 90 ||
            dto.longitude < -180 ||
            dto.longitude > 180
        ) {
            throw new Error("Invalid GPS coordinates");
        }

        if (
            !Number.isFinite(dto.accuracy) ||
            dto.accuracy < 0
        ) {
            throw new Error("Invalid GPS accuracy");
        }

        const request =
            await this.emergencyRequestRepository.findById(dto.requestId);

        if (!request) {
            throw new Error("Emergency request not found");
        }

         if (String(request.assignedMechanicId) !== mechanicId) {
            throw new Error("You are not assigned to this request");
        }

        if (request.status !== "on_the_way") {
            throw new Error("Location sharing is not allowed for this request");
        }

        const location: StoredMechanicLocation = {
            ...dto,
            mechanicId,
            updatedAt: new Date().toISOString()
        };

        await this.mechanicLocationStore.save(location);

        return location;
    }
}