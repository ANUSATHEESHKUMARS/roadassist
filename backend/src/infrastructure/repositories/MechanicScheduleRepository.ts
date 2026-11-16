
import { MechanicSchedule } from "../../domain/User/entities/MechanicSchedule.js";


import { MechanicScheduleModel } from "../databases/models/MechanicScheduleModel.js";
import { MechanicScheduleMapper } from "../../application/mappers/MechanicScheduleMapper.js";
import { IMechanicScheduleRepository } from "../../domain/repositories/IMechanicScheduleRepository.js";
export class MechanicScheduleRepository
    implements IMechanicScheduleRepository {

    async create(
        schedule: MechanicSchedule
    ): Promise<MechanicSchedule> {

        const created = await MechanicScheduleModel.create({
            mechanicId: schedule.mechanicId,
            weeklyAvailability: schedule.weeklyAvailability,
            morningStartTime: schedule.morningStartTime,
            morningEndTime: schedule.morningEndTime,
            eveningStartTime: schedule.eveningStartTime,
            eveningEndTime: schedule.eveningEndTime,
            isActive: schedule.isActive
        });

        return MechanicScheduleMapper.toEntity(created);
    }

    async findByMechanicId(
        mechanicId: string
    ): Promise<MechanicSchedule | null> {

        const schedule = await MechanicScheduleModel.findOne({
            mechanicId
        });

        if (!schedule) {
            return null;
        }

        return MechanicScheduleMapper.toEntity(schedule);
    }

    async update(
        mechanicId: string,
        schedule: Partial<MechanicSchedule>
    ): Promise<MechanicSchedule | null> {

        const {
            weeklyAvailability,
            morningStartTime,
            morningEndTime,
            eveningStartTime,
            eveningEndTime,
            isActive
        } = schedule;

        const updated = await MechanicScheduleModel.findOneAndUpdate(
            { mechanicId },
            {
                $set: {
                    ...(weeklyAvailability !== undefined && {
                        weeklyAvailability
                    }),
                    ...(morningStartTime !== undefined && {
                        morningStartTime
                    }),
                    ...(morningEndTime !== undefined && {
                        morningEndTime
                    }),
                    ...(eveningStartTime !== undefined && {
                        eveningStartTime
                    }),
                    ...(eveningEndTime !== undefined && {
                        eveningEndTime
                    }),
                    ...(isActive !== undefined && {
                        isActive
                    })
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updated) {
            return null;
        }

        return MechanicScheduleMapper.toEntity(updated);
    }
}
