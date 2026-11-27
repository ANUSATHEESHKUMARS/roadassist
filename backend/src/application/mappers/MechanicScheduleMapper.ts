
import {
    DateAvailability,
    MechanicSchedule,
} from "../../domain/User/entities/MechanicSchedule.js";
import { IMechanicScheduleDocument } from "../../infrastructure/databases/models/MechanicScheduleModel.js";
export class MechanicScheduleMapper {

    static toEntity(
        document: IMechanicScheduleDocument
    ): MechanicSchedule {
        const dateAvailability: DateAvailability[] = (
            document.dateAvailability ?? []
        ).map((entry) => ({
            date: entry.date,
            isAvailable: entry.isAvailable,
            morning: entry.morning,
            afternoon: entry.afternoon,
            ...(entry.morningStartTime !== undefined && {
                morningStartTime: entry.morningStartTime,
            }),
            ...(entry.morningEndTime !== undefined && {
                morningEndTime: entry.morningEndTime,
            }),
            ...(entry.afternoonStartTime !== undefined && {
                afternoonStartTime: entry.afternoonStartTime,
            }),
            ...(entry.afternoonEndTime !== undefined && {
                afternoonEndTime: entry.afternoonEndTime,
            }),
        }));

        return new MechanicSchedule(
            document.mechanicId.toString(),
            document.weeklyAvailability.map((item) => ({
                day: item.day,
                morning: item.morning,
                afternoon: item.afternoon,
            })),
            document.morningStartTime,
            document.morningEndTime,
            document.afternoonStartTime,
            document.afternoonEndTime,
            document.isActive,
            document._id.toString(),
            document.createdAt,
            document.updatedAt,
            dateAvailability
        );
    }
}
