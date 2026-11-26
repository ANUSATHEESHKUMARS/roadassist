
import { DailySchedule } from "../../../domain/User/entities/MechanicSchedule.js";

export interface UpdateMechanicScheduleDto {
    weeklyAvailability?: DailySchedule[];

    morningStartTime?: string;
    morningEndTime?: string;

    afternoonStartTime?: string;
    afternoonEndTime?: string;

    isActive?: boolean;
}
