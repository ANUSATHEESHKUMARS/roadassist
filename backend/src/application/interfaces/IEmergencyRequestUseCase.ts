import { EmergencyRequest } from "../../domain/User/entities/EmergencyRequest.js";
import { CreateEmergencyRequestDto } from "../dtos/CreateEmergencyRequest.js";

export interface ICreateEmergencyRequestUseCase {
    execute(userId: string,
        dto: CreateEmergencyRequestDto
    ): Promise<EmergencyRequest>
}

