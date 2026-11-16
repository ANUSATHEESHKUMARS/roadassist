
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
    evening: boolean;
}

export interface MechanicSchedule {
    id?: string;
    mechanicId: string;
    weeklyAvailability: DailySchedule[];
    morningStartTime: string;
    morningEndTime: string;
    eveningStartTime: string;
    eveningEndTime: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateMechanicScheduleDto {
    weeklyAvailability: DailySchedule[];
    morningStartTime: string;
    morningEndTime: string;
    eveningStartTime: string;
    eveningEndTime: string;
    isActive: boolean;
}

export type UpdateMechanicScheduleDto =
    Partial<CreateMechanicScheduleDto>;

export interface CommonResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}
