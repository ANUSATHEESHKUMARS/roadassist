import { DailySchedule } from "../../../domain/User/entities/MechanicSchedule.js";

export interface UpdateMechanicScheduleDto {
    weeklyAvailability?: DailySchedule[];

    morningStartTime?: string;
    morningEndTime?: string;

    eveningStartTime?: string;
    eveningEndTime?: string;

    isActive?: boolean;
}