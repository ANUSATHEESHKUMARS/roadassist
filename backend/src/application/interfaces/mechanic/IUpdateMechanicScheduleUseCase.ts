
import { MechanicSchedule } from "../../../domain/User/entities/MechanicSchedule.js";
import { UpdateMechanicScheduleDto } from "../../dtos/mechanic/UpdateScheduleDto.js";


export interface IUpdateMechanicScheduleUseCase {
    execute(
        mechanicId: string,
        dto: UpdateMechanicScheduleDto
    ): Promise<MechanicSchedule>;
}