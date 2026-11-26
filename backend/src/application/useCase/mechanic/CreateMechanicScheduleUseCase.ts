
import { MechanicSchedule } from "../../../domain/User/entities/MechanicSchedule.js";

import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";

import { CreateMechanicScheduleDto } from "../../dtos/createMechanicScheduleDto.js";

import { MechanicScheduleValidator } from "../../validators/MechanicScheduleValidator.js";

import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ICreateMechanicScheduleUseCase } from "../../interfaces/mechanic/ICreateMechanicScheduleUseCase.js";
export class CreateMechanicScheduleUseCase
    implements ICreateMechanicScheduleUseCase {

    constructor(
        private readonly scheduleRepository: IMechanicScheduleRepository
    ) { }

    async execute(
        mechanicId: string,
        dto: CreateMechanicScheduleDto
    ): Promise<MechanicSchedule> {

        MechanicScheduleValidator.validate(dto);

        const existingSchedule =
            await this.scheduleRepository.findByMechanicId(mechanicId);

        if (existingSchedule) {
            throw new ConflictError(
                "Mechanic schedule already exists"
            );
        }

        const schedule = new MechanicSchedule(
            mechanicId,
            dto.weeklyAvailability,
            dto.morningStartTime,
            dto.morningEndTime,
            dto.afternoonStartTime,
            dto.afternoonEndTime,
            true
        );

        return await this.scheduleRepository.create(schedule);
    }
}
