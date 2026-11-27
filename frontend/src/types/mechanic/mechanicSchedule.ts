
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

export interface DateAvailability {
    date: string;
    isAvailable: boolean;
    morning: boolean;
    afternoon: boolean;
    morningStartTime?: string;
    morningEndTime?: string;
    afternoonStartTime?: string;
    afternoonEndTime?: string;
}

export interface MechanicBookedDate {
    bookingId: string;
    date: string;
    slot: "morning" | "afternoon" | "full_day";
    status: string;
}

export interface MechanicSchedule {
    id?: string;
    mechanicId: string;
    weeklyAvailability: DailySchedule[];
    dateAvailability?: DateAvailability[];
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
    dateAvailability?: DateAvailability[];
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
