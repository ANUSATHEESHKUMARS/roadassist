
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

        const normalizedDateAvailability =
            dto.dateAvailability !== undefined
                ? MechanicScheduleValidator.validateDateAvailabilityList(
                      dto.dateAvailability,
                      {
                          morningStartTime: dto.morningStartTime,
                          morningEndTime: dto.morningEndTime,
                          afternoonStartTime: dto.afternoonStartTime,
                          afternoonEndTime: dto.afternoonEndTime,
                      }
                  )
                : [];

        const schedule = new MechanicSchedule(
            mechanicId,
            dto.weeklyAvailability,
            dto.morningStartTime,
            dto.morningEndTime,
            dto.afternoonStartTime,
            dto.afternoonEndTime,
            dto.isActive !== undefined ? dto.isActive : true,
            undefined,
            undefined,
            undefined,
            normalizedDateAvailability
        );

        return await this.scheduleRepository.create(schedule);
    }
}
