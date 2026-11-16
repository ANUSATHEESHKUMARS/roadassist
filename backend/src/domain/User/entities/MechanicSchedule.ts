
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

export class MechanicSchedule {
    constructor(
        public mechanicId: string,
        public weeklyAvailability: DailySchedule[],
        public morningStartTime: string,
        public morningEndTime: string,
        public eveningStartTime: string,
        public eveningEndTime: string,
        public isActive: boolean,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}
}
