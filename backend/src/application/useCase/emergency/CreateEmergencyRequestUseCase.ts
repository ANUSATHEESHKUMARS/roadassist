import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequest.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { CreateEmergencyRequestDto } from "../../dtos/CreateEmergencyRequest.js";
import { ICreateEmergencyRequestUseCase } from "../../interfaces/IEmergencyRequestUseCase.js";
import { ICreateEmergencyRequestValidator } from "../../validators/interfaces/ICreateEmergencyRequestValidator.js";

export class CreateEmergencyRequestUseCase implements ICreateEmergencyRequestUseCase {
    constructor(
        private readonly emergencyRequestRespository: IEmergencyRequestRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly createRequestValidator: ICreateEmergencyRequestValidator
    ) { }
    async execute(userId: string, dto: CreateEmergencyRequestDto): Promise<EmergencyRequest> {
        this.createRequestValidator.validate(dto)

        if (!userId || !userId.trim()) {
            throw new UnauthorizedError("Authentication user Id is reuired", "AUTHENTICATION_IS_REQUIRED")
        }

        const vehicle = await this.vehicleRepository.findById(dto.vehicleId)

        if (!vehicle) {
            throw new ForbiddenError("Vehicle not found", "VEHICLE_NOT_FOUND")
        }
        if (vehicle.userId !== userId) {
            throw new UnauthorizedError("You are not authorized to use this vehicle")
        }
        const emergencyRequest = new EmergencyRequest(
            userId,
            dto.vehicleId,
            {
                latitude: dto.location.latitude,
                longitude: dto.location.longitude,
                ...(dto.location.address !== undefined && {
                    address: dto.location.address.trim(),

                })
            },
            dto.emergencyIssueCategory,
            dto.issueTitle.trim(),
            dto.issueDescription?.trim(),
            dto.issueImages ?? [],
            "pending",
            null
        )
        console.log("Emergency request entity:", emergencyRequest);
        console.log("Entity vehicleId:", emergencyRequest.vehicleId);

        return this.emergencyRequestRespository.create(emergencyRequest)
    }
}


