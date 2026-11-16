
import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js"

import { IUpdateMechanicScheduleUseCase } from "../../interfaces/mechanic/IUpdateMechanicScheduleUseCase.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { UpdateMechanicScheduleDto } from "../../dtos/mechanic/UpdateScheduleDto.js";
export class UpdateMechanicScheduleUseCase
    implements IUpdateMechanicScheduleUseCase {

    constructor(
        private readonly scheduleRepository: IMechanicScheduleRepository
    ) {}

    async execute(
        mechanicId: string,
        dto: UpdateMechanicScheduleDto
    ) {

        const existingSchedule =
            await this.scheduleRepository.findByMechanicId(mechanicId);

        if (!existingSchedule) {
            throw new NotfoundError("Mechanic schedule not found");
        }

        const updatedSchedule =
            await this.scheduleRepository.update(mechanicId, dto);

        if (!updatedSchedule) {
            throw new Error("Failed to update mechanic schedule");
        }

        return updatedSchedule;
    }
}
