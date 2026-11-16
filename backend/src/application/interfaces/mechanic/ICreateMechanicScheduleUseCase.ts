import { MechanicSchedule } from "../../../domain/User/entities/MechanicSchedule.js";
import { CreateMechanicScheduleDto } from "../../dtos/createMechanicScheduleDto.js"

export interface ICreateMechanicScheduleUseCase {
    execute(
        mechanicId: string,
        dto: CreateMechanicScheduleDto
    ): Promise<MechanicSchedule>;
}