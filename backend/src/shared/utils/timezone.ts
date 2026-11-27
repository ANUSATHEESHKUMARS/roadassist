import { BookingSlot } from "../../domain/User/Types/BookingTypes.js";
import { BadRequest } from "../errors/BadRequestError.js";

export const INDIA_TIME_ZONE = "Asia/Kolkata";

export const WEEKDAY_MAP = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
] as const;

export type IndiaWeekday = (typeof WEEKDAY_MAP)[number];

export interface IndiaDateParts {
    year: number;
    month: number;
    day: number;
    weekday: number;
    dayOfWeek: IndiaWeekday;
    hours: number;
    minutes: number;
}

export function getIndiaDateParts(date: Date): IndiaDateParts {
    if (Number.isNaN(date.getTime())) {
        throw new BadRequest("Invalid date provided");
    }

    const parts = new Intl.DateTimeFormat("en-IN", {
        timeZone: INDIA_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        weekday: "long",
    }).formatToParts(date);

    const getPart = (type: string): string => {
        const value = parts.find((part) => part.type === type)?.value;
        if (!value) {
            throw new BadRequest("Unable to process date in Asia/Kolkata");
        }
        return value;
    };

    const weekdayName = getPart("weekday").toLowerCase() as IndiaWeekday;
    const weekday = WEEKDAY_MAP.indexOf(weekdayName);

    if (weekday === -1) {
        throw new BadRequest("Unable to determine weekday");
    }

    const rawHour = Number(getPart("hour"));

    return {
        year: Number(getPart("year")),
        month: Number(getPart("month")),
        day: Number(getPart("day")),
        weekday,
        dayOfWeek: weekdayName,
        hours: rawHour === 24 ? 0 : rawHour,
        minutes: Number(getPart("minute")),
    };
}

export function getIndiaDayKey(date: Date): string {
    const parts = getIndiaDateParts(date);
    const month = String(parts.month).padStart(2, "0");
    const day = String(parts.day).padStart(2, "0");
    return `${parts.year}-${month}-${day}`;
}

export function getIndiaDayRange(date: Date): {
    startOfDay: Date;
    endOfDay: Date;
} {
    const parts = getIndiaDateParts(date);

    const startOfDay = new Date(
        Date.UTC(parts.year, parts.month - 1, parts.day) - (5 * 60 + 30) * 60 * 1000
    );

    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return { startOfDay, endOfDay };
}

export function compareIndiaDateWithToday(date: Date, now: Date = new Date()): -1 | 0 | 1 {
    const target = getIndiaDateParts(date);
    const today = getIndiaDateParts(now);

    const targetValue = target.year * 10000 + target.month * 100 + target.day;
    const todayValue = today.year * 10000 + today.month * 100 + today.day;

    if (targetValue < todayValue) return -1;
    if (targetValue === todayValue) return 0;
    return 1;
}

function parseTimeToMinutes(timeStr: string, fallbackMinutes: number): number {
    const match = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
    if (!match) return fallbackMinutes;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return fallbackMinutes;
    }
    return hours * 60 + minutes;
}

export function isShiftWindowPassedForDate(
    scheduledDate: Date,
    slot: BookingSlot,
    scheduleTimes?: {
        morningStartTime?: string;
        morningEndTime?: string;
        afternoonStartTime?: string;
        afternoonEndTime?: string;
    },
    now: Date = new Date()
): boolean {
    const comparison = compareIndiaDateWithToday(scheduledDate, now);
    if (comparison < 0) return true;
    if (comparison > 0) return false;

    const nowParts = getIndiaDateParts(now);
    const currentMinutes = nowParts.hours * 60 + nowParts.minutes;

    const morningStartMinutes = scheduleTimes?.morningStartTime
        ? parseTimeToMinutes(scheduleTimes.morningStartTime, 9 * 60)
        : 9 * 60;

    const afternoonStartMinutes = scheduleTimes?.afternoonStartTime
        ? parseTimeToMinutes(scheduleTimes.afternoonStartTime, 14 * 60)
        : 14 * 60;

    if (slot === "morning" || slot === "full_day") {
        return currentMinutes >= morningStartMinutes;
    }

    return currentMinutes >= afternoonStartMinutes;
}

