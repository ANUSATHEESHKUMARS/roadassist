
import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequest.js";
import { IMechanicAvailabilityRepository } from "../../../domain/repositories/IMechanicAvailabilityRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { CreateEmergencyRequestDto } from "../../dtos/CreateEmergencyRequest.js";
import { ICreateEmergencyRequestUseCase } from "../../interfaces/IEmergencyRequestUseCase.js";
import { IMechanicNotificationService } from "../../interfaces/mechanic/IMechanicNotificationService.js";
import { ICreateEmergencyRequestValidator } from "../../validators/interfaces/ICreateEmergencyRequestValidator.js";

export class CreateEmergencyRequestUseCase implements ICreateEmergencyRequestUseCase {

    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly createRequestValidator: ICreateEmergencyRequestValidator,
        private readonly mechanicAvailabilityRepository: IMechanicAvailabilityRepository,
        private readonly mechanicNotificationService: IMechanicNotificationService
    ) {}

    async execute(
        userId: string,
        dto: CreateEmergencyRequestDto
    ): Promise<EmergencyRequest> {

        this.createRequestValidator.validate(dto);

        if (!userId || !userId.trim()) {
            throw new UnauthorizedError(
                "Authentication user Id is required",
                "AUTHENTICATION_IS_REQUIRED"
            );
        }

        const vehicle = await this.vehicleRepository.findById(dto.vehicleId);

        if (!vehicle) {
            throw new ForbiddenError(
                "Vehicle not found",
                "VEHICLE_NOT_FOUND"
            );
        }

        if (vehicle.userId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to use this vehicle"
            );
        }

        const emergencyRequest = new EmergencyRequest(
            userId,
            dto.vehicleId,
            {
                latitude: dto.location.latitude,
                longitude: dto.location.longitude,
                ...(dto.location.address !== undefined && {
                    address: dto.location.address.trim()
                })
            },
            dto.emergencyIssueCategory,
            dto.issueTitle.trim(),
            dto.issueDescription?.trim(),
            dto.issueImages ?? [],
            "pending",
            null
        );

        const savedRequest =
            await this.emergencyRequestRepository.create(emergencyRequest);

        let mechanics =
            await this.mechanicAvailabilityRepository.findNearbyAvailableMechanics(
                dto.location.latitude,
                dto.location.longitude,
                5
            );

        if (mechanics.length === 0) {
            mechanics =
                await this.mechanicAvailabilityRepository.findNearbyAvailableMechanics(
                    dto.location.latitude,
                    dto.location.longitude,
                    10
                );
        }

        const notificationResults = await Promise.allSettled(
            mechanics.map(mechanic =>
                this.mechanicNotificationService.notifyNewEmergencyRequest(
                    mechanic.mechanicId,
                    savedRequest
                )
            )
        );

        notificationResults.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                    `Failed to notify mechanic ${mechanics[index]?.mechanicId}:`,
                    result.reason
                );
            }
        });

        return savedRequest;
    }
}
