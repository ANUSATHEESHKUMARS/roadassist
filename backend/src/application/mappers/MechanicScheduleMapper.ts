
import { MechanicSchedule } from "../../domain/User/entities/MechanicSchedule.js";
import { IMechanicScheduleDocument } from "../../infrastructure/databases/models/MechanicScheduleModel.js";
export class MechanicScheduleMapper {

    static toEntity(
        document: IMechanicScheduleDocument
    ): MechanicSchedule {

        return new MechanicSchedule(
            document.mechanicId.toString(),
            document.weeklyAvailability,
            document.morningStartTime,
            document.morningEndTime,
            document.eveningStartTime,
            document.eveningEndTime,
            document.isActive,
            document._id.toString(),
            document.createdAt,
            document.updatedAt
        );
    }
}
