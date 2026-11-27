import { CreateMechanicScheduleDto } from "../dtos/createMechanicScheduleDto.js";
import { UpdateMechanicScheduleDto } from "../dtos/mechanic/UpdateScheduleDto.js";
import {
    DateAvailability,
    DayOfWeek,
    MechanicSchedule,
} from "../../domain/User/entities/MechanicSchedule.js";
import { BadRequest } from "../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../shared/errors/ConflitError.js";
import {
    compareIndiaDateWithToday,
    isValidDateKey,
    parseIndiaDateKeyToDate,
} from "../../shared/utils/timezone.js";

export interface BaseShiftTimings {
    morningStartTime: string;
    morningEndTime: string;
    afternoonStartTime: string;
    afternoonEndTime: string;
}

export class MechanicScheduleValidator {
    private static readonly validDays: DayOfWeek[] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    private static readonly timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    static validate(dto: CreateMechanicScheduleDto): void {
        if (!dto || typeof dto !== "object") {
            throw new BadRequest("Schedule payload is required", "INVALID_SCHEDULE");
        }

        this.validateDays(dto.weeklyAvailability);

        if (dto.isActive !== false) {
            const hasDateAvailable = (dto.dateAvailability ?? []).some(
                (entry) => entry.isAvailable && (entry.morning || entry.afternoon)
            );
            const hasWeeklyAvailable = dto.weeklyAvailability.some(
                (day) => day.morning || day.afternoon
            );
            if (!hasWeeklyAvailable && !hasDateAvailable) {
                throw new BadRequest(
                    "At least one working shift must be enabled",
                    "NO_WORKING_SHIFTS"
                );
            }
        }

        this.validateTimeFormat([
            dto.morningStartTime,
            dto.morningEndTime,
            dto.afternoonStartTime,
            dto.afternoonEndTime,
        ]);

        const baseTimings: BaseShiftTimings = {
            morningStartTime: dto.morningStartTime,
            morningEndTime: dto.morningEndTime,
            afternoonStartTime: dto.afternoonStartTime,
            afternoonEndTime: dto.afternoonEndTime,
        };

        this.validateShiftTimings(baseTimings);

        if (dto.dateAvailability !== undefined) {
            this.validateDateAvailabilityList(dto.dateAvailability, baseTimings);
        }
    }

    static validateUpdate(
        dto: UpdateMechanicScheduleDto,
        existingSchedule: MechanicSchedule,
        now: Date = new Date()
    ): void {
        if (!dto || typeof dto !== "object") {
            throw new BadRequest(
                "Schedule update payload is required",
                "INVALID_SCHEDULE"
            );
        }

        const effectiveWeekly =
            dto.weeklyAvailability ?? existingSchedule.weeklyAvailability;
        const effectiveIsActive =
            dto.isActive !== undefined ? dto.isActive : existingSchedule.isActive;

        if (dto.weeklyAvailability !== undefined) {
            this.validateDays(dto.weeklyAvailability);
        }

        const effectiveTimings: BaseShiftTimings = {
            morningStartTime:
                dto.morningStartTime ?? existingSchedule.morningStartTime,
            morningEndTime: dto.morningEndTime ?? existingSchedule.morningEndTime,
            afternoonStartTime:
                dto.afternoonStartTime ?? existingSchedule.afternoonStartTime,
            afternoonEndTime:
                dto.afternoonEndTime ?? existingSchedule.afternoonEndTime,
        };

        this.validateTimeFormat([
            effectiveTimings.morningStartTime,
            effectiveTimings.morningEndTime,
            effectiveTimings.afternoonStartTime,
            effectiveTimings.afternoonEndTime,
        ]);

        this.validateShiftTimings(effectiveTimings);

        let normalizedOverrides = existingSchedule.dateAvailability ?? [];
        if (dto.dateAvailability !== undefined) {
            const existingMap = new Map(
                (existingSchedule.dateAvailability ?? []).map((entry) => [
                    entry.date,
                    entry,
                ])
            );
            normalizedOverrides = this.validateDateAvailabilityList(
                dto.dateAvailability,
                effectiveTimings,
                now,
                existingMap
            );
        }

        const hasAvailableOverride = normalizedOverrides.some(
            (entry) => entry.isAvailable && (entry.morning || entry.afternoon)
        );

        if (
            effectiveIsActive &&
            !effectiveWeekly.some((d) => d.morning || d.afternoon) &&
            !hasAvailableOverride
        ) {
            throw new BadRequest(
                "At least one working shift must be enabled when schedule is active",
                "NO_WORKING_SHIFTS"
            );
        }
    }

    static validateDateAvailabilityEntry(
        entry: DateAvailability,
        baseTimings: BaseShiftTimings,
        now: Date = new Date(),
        options: { allowUnchangedPast?: boolean } = {}
    ): DateAvailability {
        if (!entry || typeof entry !== "object") {
            throw new BadRequest(
                "Date availability entry must be an object",
                "INVALID_DATE_AVAILABILITY"
            );
        }

        const rawDate = typeof entry.date === "string" ? entry.date.trim() : "";
        if (!isValidDateKey(rawDate)) {
            throw new BadRequest(
                `Invalid calendar date "${entry.date ?? ""}". Use valid YYYY-MM-DD format`,
                "INVALID_DATE_FORMAT"
            );
        }

        const parsedDate = parseIndiaDateKeyToDate(rawDate);
        if (
            !options.allowUnchangedPast &&
            compareIndiaDateWithToday(parsedDate, now) < 0
        ) {
            throw new BadRequest(
                `Cannot configure availability for past date (${rawDate})`,
                "PAST_DATE_NOT_ALLOWED"
            );
        }

        if (typeof entry.isAvailable !== "boolean") {
            throw new BadRequest(
                "isAvailable flag must be a boolean",
                "INVALID_SHIFT_COMBINATION"
            );
        }

        const morning = Boolean(entry.morning);
        const afternoon = Boolean(entry.afternoon);

        if (!entry.isAvailable && (morning || afternoon)) {
            throw new BadRequest(
                `Unavailable date (${rawDate}) cannot have morning or afternoon shift enabled`,
                "INVALID_SHIFT_COMBINATION"
            );
        }

        if (entry.isAvailable && !morning && !afternoon) {
            throw new BadRequest(
                `Available date (${rawDate}) must enable morning, afternoon, or both shifts`,
                "INVALID_SHIFT_COMBINATION"
            );
        }

        const morningStartTime =
            entry.morningStartTime !== undefined && entry.morningStartTime !== ""
                ? entry.morningStartTime.trim()
                : undefined;
        const morningEndTime =
            entry.morningEndTime !== undefined && entry.morningEndTime !== ""
                ? entry.morningEndTime.trim()
                : undefined;
        const afternoonStartTime =
            entry.afternoonStartTime !== undefined && entry.afternoonStartTime !== ""
                ? entry.afternoonStartTime.trim()
                : undefined;
        const afternoonEndTime =
            entry.afternoonEndTime !== undefined && entry.afternoonEndTime !== ""
                ? entry.afternoonEndTime.trim()
                : undefined;

        const customTimes = [
            morningStartTime,
            morningEndTime,
            afternoonStartTime,
            afternoonEndTime,
        ].filter((t): t is string => t !== undefined);

        if (customTimes.length > 0) {
            this.validateTimeFormat(customTimes);
        }

        if ((morningStartTime !== undefined) !== (morningEndTime !== undefined)) {
            throw new BadRequest(
                `Provide both start and end times for morning shift on ${rawDate}`,
                "INCOMPLETE_CUSTOM_TIMINGS"
            );
        }

        if (
            (afternoonStartTime !== undefined) !==
            (afternoonEndTime !== undefined)
        ) {
            throw new BadRequest(
                `Provide both start and end times for afternoon shift on ${rawDate}`,
                "INCOMPLETE_CUSTOM_TIMINGS"
            );
        }

        if (
            !entry.isAvailable &&
            (morningStartTime !== undefined ||
                morningEndTime !== undefined ||
                afternoonStartTime !== undefined ||
                afternoonEndTime !== undefined)
        ) {
            throw new BadRequest(
                `Unavailable date (${rawDate}) cannot define custom shift timings`,
                "INVALID_SHIFT_COMBINATION"
            );
        }

        if (
            (morningStartTime !== undefined && !morning) ||
            (afternoonStartTime !== undefined && !afternoon)
        ) {
            throw new BadRequest(
                `Custom timings on ${rawDate} can only be set for enabled shifts`,
                "INVALID_SHIFT_COMBINATION"
            );
        }

        if (morningStartTime !== undefined && morningEndTime !== undefined) {
            if (morningStartTime >= morningEndTime) {
                throw new BadRequest(
                    `Morning end time must be after morning start time on ${rawDate}`,
                    "INVALID_SHIFT_TIMINGS"
                );
            }
        }

        if (afternoonStartTime !== undefined && afternoonEndTime !== undefined) {
            if (afternoonStartTime >= afternoonEndTime) {
                throw new BadRequest(
                    `Afternoon end time must be after afternoon start time on ${rawDate}`,
                    "INVALID_SHIFT_TIMINGS"
                );
            }
        }

        const resolvedMorningEnd = morningEndTime ?? baseTimings.morningEndTime;
        const resolvedAfternoonStart =
            afternoonStartTime ?? baseTimings.afternoonStartTime;

        if (
            entry.isAvailable &&
            morning &&
            afternoon &&
            resolvedMorningEnd > resolvedAfternoonStart
        ) {
            throw new BadRequest(
                `Morning and afternoon shifts cannot overlap on ${rawDate}`,
                "OVERLAPPING_SHIFT_TIMINGS"
            );
        }

        return {
            date: rawDate,
            isAvailable: entry.isAvailable,
            morning: entry.isAvailable ? morning : false,
            afternoon: entry.isAvailable ? afternoon : false,
            ...(morningStartTime !== undefined && { morningStartTime }),
            ...(morningEndTime !== undefined && { morningEndTime }),
            ...(afternoonStartTime !== undefined && { afternoonStartTime }),
            ...(afternoonEndTime !== undefined && { afternoonEndTime }),
        };
    }

    static validateDateAvailabilityList(
        entries: DateAvailability[],
        baseTimings: BaseShiftTimings,
        now: Date = new Date(),
        existingByDate?: Map<string, DateAvailability>
    ): DateAvailability[] {
        if (!Array.isArray(entries)) {
            throw new BadRequest(
                "dateAvailability must be an array",
                "INVALID_DATE_AVAILABILITY"
            );
        }

        const seenDates = new Set<string>();
        const normalized: DateAvailability[] = [];

        for (const entry of entries) {
            const rawDate =
                entry && typeof entry.date === "string" ? entry.date.trim() : "";

            if (rawDate && seenDates.has(rawDate)) {
                throw new ConflictError(
                    `Duplicate date entry is not allowed (${rawDate})`,
                    "DUPLICATE_DATE_ENTRY"
                );
            }

            const existing = rawDate ? existingByDate?.get(rawDate) : undefined;
            const isUnchangedPast = Boolean(
                existing &&
                    existing.isAvailable === entry.isAvailable &&
                    existing.morning === entry.morning &&
                    existing.afternoon === entry.afternoon &&
                    existing.morningStartTime === entry.morningStartTime &&
                    existing.morningEndTime === entry.morningEndTime &&
                    existing.afternoonStartTime === entry.afternoonStartTime &&
                    existing.afternoonEndTime === entry.afternoonEndTime
            );

            const clean = this.validateDateAvailabilityEntry(
                entry,
                baseTimings,
                now,
                { allowUnchangedPast: isUnchangedPast }
            );
            seenDates.add(clean.date);
            normalized.push(clean);
        }

        return normalized.sort((a, b) => a.date.localeCompare(b.date));
    }

    private static validateDays(
        weeklyAvailability: CreateMechanicScheduleDto["weeklyAvailability"]
    ): void {
        if (
            !Array.isArray(weeklyAvailability) ||
            weeklyAvailability.length !== 7
        ) {
            throw new BadRequest(
                "Weekly schedule must contain exactly seven days",
                "INVALID_WEEKLY_DAYS"
            );
        }

        const days = weeklyAvailability.map((item) => item.day);
        const uniqueDays = new Set(days);

        if (uniqueDays.size !== 7) {
            throw new BadRequest(
                "Duplicate days are not allowed",
                "DUPLICATE_WEEKLY_DAYS"
            );
        }

        const hasInvalidDay = days.some((day) => !this.validDays.includes(day));

        if (hasInvalidDay) {
            throw new BadRequest(
                "Invalid day found in weekly schedule",
                "INVALID_WEEKLY_DAY"
            );
        }
    }

    private static validateTimeFormat(times: string[]): void {
        const invalidTime = times.some(
            (time) =>
                typeof time !== "string" || !this.timeRegex.test(time.trim())
        );

        if (invalidTime) {
            throw new BadRequest(
                "Invalid time format. Use HH:mm",
                "INVALID_TIME_FORMAT"
            );
        }
    }

    private static validateShiftTimings(timings: BaseShiftTimings): void {
        if (timings.morningStartTime >= timings.morningEndTime) {
            throw new BadRequest(
                "Morning end time must be after morning start time",
                "INVALID_MORNING_TIMINGS"
            );
        }

        if (timings.afternoonStartTime >= timings.afternoonEndTime) {
            throw new BadRequest(
                "Afternoon end time must be after afternoon start time",
                "INVALID_AFTERNOON_TIMINGS"
            );
        }

        if (timings.morningEndTime > timings.afternoonStartTime) {
            throw new BadRequest(
                "Morning and afternoon shifts must not overlap",
                "OVERLAPPING_SHIFT_TIMINGS"
            );
        }
    }
}
