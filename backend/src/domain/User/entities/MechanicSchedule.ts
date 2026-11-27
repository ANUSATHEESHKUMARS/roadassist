
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

export class MechanicSchedule {
    constructor(
        public mechanicId: string,
        public weeklyAvailability: DailySchedule[],
        public morningStartTime: string,
        public morningEndTime: string,
        public afternoonStartTime: string,
        public afternoonEndTime: string,
        public isActive: boolean,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
        public dateAvailability: DateAvailability[] = []
    ) {}
}
