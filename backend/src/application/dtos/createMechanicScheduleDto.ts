
import { DailySchedule } from "../../domain/User/entities/MechanicSchedule.js";

export interface CreateMechanicScheduleDto {
    weeklyAvailability: DailySchedule[];

    morningStartTime: string;
    morningEndTime: string;

    afternoonStartTime: string;
    afternoonEndTime: string;
}
