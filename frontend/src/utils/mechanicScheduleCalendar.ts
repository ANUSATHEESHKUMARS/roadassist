import type {
    CreateMechanicScheduleDto,
    DateAvailability,
    DayOfWeek,
} from "@/types/mechanic/mechanicSchedule";

const INDIA_TIME_ZONE = "Asia/Kolkata";

const WEEKDAY_NAMES: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

export function getIndiaTodayDateKey(now: Date = new Date()): string {
    const parts = new Intl.DateTimeFormat("en-IN", {
        timeZone: INDIA_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);

    const get = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "01";

    return `${get("year")}-${get("month")}-${get("day")}`;
}

export function getMonthKey(year: number, monthIndex0: number): string {
    return `${year}-${String(monthIndex0 + 1).padStart(2, "0")}`;
}

export function parseDateKeyParts(dateKey: string): {
    year: number;
    monthIndex0: number;
    day: number;
} {
    const [y, m, d] = dateKey.split("-").map(Number);
    return {
        year: y,
        monthIndex0: m - 1,
        day: d,
    };
}

export function getWeekdayKeyFromDateKey(dateKey: string): DayOfWeek {
    const { year, monthIndex0, day } = parseDateKeyParts(dateKey);
    const utcDay = new Date(Date.UTC(year, monthIndex0, day)).getUTCDay();
    return WEEKDAY_NAMES[utcDay] ?? "monday";
}

export function formatDateKeyReadable(dateKey: string): string {
    const date = new Date(`${dateKey}T00:00:00+05:30`);
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: INDIA_TIME_ZONE,
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function formatMonthTitle(year: number, monthIndex0: number): string {
    const date = new Date(Date.UTC(year, monthIndex0, 15));
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "UTC",
        month: "long",
        year: "numeric",
    }).format(date);
}

export interface CalendarGridCell {
    dateKey: string;
    dayOfMonth: number;
    isCurrentMonth: boolean;
}

/** Builds a Monday-first 6-week (or 5-week) calendar grid for the given month. */
export function buildMonthCalendarGrid(
    year: number,
    monthIndex0: number
): CalendarGridCell[] {
    const firstUtc = new Date(Date.UTC(year, monthIndex0, 1));
    const firstWeekdaySun0 = firstUtc.getUTCDay();
    const mondayOffset = (firstWeekdaySun0 + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();

    const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
    const cells: CalendarGridCell[] = [];

    for (let i = 0; i < totalCells; i++) {
        const cellUtc = new Date(
            Date.UTC(year, monthIndex0, 1 - mondayOffset + i)
        );
        const y = cellUtc.getUTCFullYear();
        const m = String(cellUtc.getUTCMonth() + 1).padStart(2, "0");
        const d = String(cellUtc.getUTCDate()).padStart(2, "0");

        cells.push({
            dateKey: `${y}-${m}-${d}`,
            dayOfMonth: cellUtc.getUTCDate(),
            isCurrentMonth: cellUtc.getUTCMonth() === monthIndex0,
        });
    }

    return cells;
}

export interface ResolvedFrontendDayAvailability {
    dateKey: string;
    dayOfWeek: DayOfWeek;
    source: "inactive" | "date_override" | "weekly";
    isAvailable: boolean;
    morning: boolean;
    afternoon: boolean;
    fullDay: boolean;
    morningStartTime: string;
    morningEndTime: string;
    afternoonStartTime: string;
    afternoonEndTime: string;
    override?: DateAvailability;
}

export function resolveFrontendDateAvailability(
    schedule: CreateMechanicScheduleDto,
    dateAvailabilityList: DateAvailability[],
    dateKey: string
): ResolvedFrontendDayAvailability {
    const dayOfWeek = getWeekdayKeyFromDateKey(dateKey);

    if (!schedule.isActive) {
        return {
            dateKey,
            dayOfWeek,
            source: "inactive",
            isAvailable: false,
            morning: false,
            afternoon: false,
            fullDay: false,
            morningStartTime: schedule.morningStartTime,
            morningEndTime: schedule.morningEndTime,
            afternoonStartTime: schedule.afternoonStartTime,
            afternoonEndTime: schedule.afternoonEndTime,
        };
    }

    const override = dateAvailabilityList.find((item) => item.date === dateKey);
    if (override) {
        const morning = override.isAvailable ? override.morning : false;
        const afternoon = override.isAvailable ? override.afternoon : false;

        return {
            dateKey,
            dayOfWeek,
            source: "date_override",
            isAvailable: override.isAvailable && (morning || afternoon),
            morning,
            afternoon,
            fullDay: morning && afternoon,
            morningStartTime:
                override.morningStartTime ?? schedule.morningStartTime,
            morningEndTime: override.morningEndTime ?? schedule.morningEndTime,
            afternoonStartTime:
                override.afternoonStartTime ?? schedule.afternoonStartTime,
            afternoonEndTime:
                override.afternoonEndTime ?? schedule.afternoonEndTime,
            override,
        };
    }

    const weeklyDay = schedule.weeklyAvailability.find(
        (item) => item.day === dayOfWeek
    );
    const morning = Boolean(weeklyDay?.morning);
    const afternoon = Boolean(weeklyDay?.afternoon);

    return {
        dateKey,
        dayOfWeek,
        source: "weekly",
        isAvailable: morning || afternoon,
        morning,
        afternoon,
        fullDay: morning && afternoon,
        morningStartTime: schedule.morningStartTime,
        morningEndTime: schedule.morningEndTime,
        afternoonStartTime: schedule.afternoonStartTime,
        afternoonEndTime: schedule.afternoonEndTime,
    };
}

