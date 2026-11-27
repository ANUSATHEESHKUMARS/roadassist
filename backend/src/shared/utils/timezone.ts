import { BookingSlot } from "../../domain/User/Types/BookingTypes.js";
import { BadRequest } from "../errors/BadRequestError.js";

export const INDIA_TIME_ZONE = "Asia/Kolkata";

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(dateKey: string): boolean {
    if (typeof dateKey !== "string" || !DATE_KEY_REGEX.test(dateKey.trim())) {
        return false;
    }

    const [yearStr, monthStr, dayStr] = dateKey.trim().split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }

    const checkDate = new Date(Date.UTC(year, month - 1, day));
    return (
        checkDate.getUTCFullYear() === year &&
        checkDate.getUTCMonth() === month - 1 &&
        checkDate.getUTCDate() === day
    );
}

export function parseIndiaDateKeyToDate(dateKey: string): Date {
    const trimmed = typeof dateKey === "string" ? dateKey.trim() : "";
    if (!isValidDateKey(trimmed)) {
        throw new BadRequest(
            "Invalid date format. Use YYYY-MM-DD",
            "INVALID_DATE_KEY"
        );
    }
    return new Date(`${trimmed}T00:00:00+05:30`);
}

export function getIndiaTodayDateKey(now: Date = new Date()): string {
    return getIndiaDayKey(now);
}

export function getIndiaDayOfWeekFromDateKey(dateKey: string): IndiaWeekday {
    const date = parseIndiaDateKeyToDate(dateKey);
    return getIndiaDateParts(date).dayOfWeek;
}

export function getIndiaDateRangeForDayKeys(
    startDateKey: string,
    endDateKey: string
): { startOfRange: Date; endOfRange: Date } {
    const startOfRange = parseIndiaDateKeyToDate(startDateKey);
    const { endOfDay } = getIndiaDayRange(parseIndiaDateKeyToDate(endDateKey));
    return { startOfRange, endOfRange: endOfDay };
}

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

