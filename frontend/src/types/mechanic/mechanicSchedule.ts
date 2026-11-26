
export type DayOfWeek =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export interface DailySchedule {
    day: DayOfWeek;
    morning: boolean;
    afternoon: boolean;
}

export interface MechanicSchedule {
    id?: string;
    mechanicId: string;
    weeklyAvailability: DailySchedule[];
    morningStartTime: string;
    morningEndTime: string;
    afternoonStartTime: string;
    afternoonEndTime: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateMechanicScheduleDto {
    weeklyAvailability: DailySchedule[];
    morningStartTime: string;
    morningEndTime: string;
    afternoonStartTime: string;
    afternoonEndTime: string;
    isActive: boolean;
}

export type UpdateMechanicScheduleDto =
    Partial<CreateMechanicScheduleDto>;

export interface CommonResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}
