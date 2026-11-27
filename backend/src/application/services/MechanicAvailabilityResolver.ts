import {
    DateAvailability,
    DayOfWeek,
    MechanicSchedule,
} from "../../domain/User/entities/MechanicSchedule.js";
import { BookingSlot } from "../../domain/User/Types/BookingTypes.js";
import { getIndiaDateParts, getIndiaDayKey } from "../../shared/utils/timezone.js";

export type AvailabilityResolutionSource =
    | "inactive"
    | "date_override"
    | "weekly"
    | "unavailable";

export interface ResolvedMechanicDayAvailability {
    dateKey: string;
    dayOfWeek: DayOfWeek;
    source: AvailabilityResolutionSource;
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

export class MechanicAvailabilityResolver {
    /**
     * Resolves a mechanic's effective availability and shift timings for a specific
     * calendar date in Asia/Kolkata. Date-specific overrides take precedence over
     * recurring weekly availability. Full-day availability is always derived from
     * both morning and afternoon shifts being available.
     */
    static resolveForDate(
        schedule: MechanicSchedule,
        scheduledDate: Date
    ): ResolvedMechanicDayAvailability {
        const dateParts = getIndiaDateParts(scheduledDate);
        const dateKey = getIndiaDayKey(scheduledDate);
        const dayOfWeek = dateParts.dayOfWeek as DayOfWeek;

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

        const override = (schedule.dateAvailability ?? []).find(
            (entry) => entry.date === dateKey
        );

        if (override) {
            const morning = override.isAvailable ? Boolean(override.morning) : false;
            const afternoon = override.isAvailable
                ? Boolean(override.afternoon)
                : false;

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
                morningEndTime:
                    override.morningEndTime ?? schedule.morningEndTime,
                afternoonStartTime:
                    override.afternoonStartTime ?? schedule.afternoonStartTime,
                afternoonEndTime:
                    override.afternoonEndTime ?? schedule.afternoonEndTime,
                override,
            };
        }

        const dailySchedule = schedule.weeklyAvailability.find(
            (item) => item.day === dayOfWeek
        );

        if (!dailySchedule) {
            return {
                dateKey,
                dayOfWeek,
                source: "unavailable",
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

        const morning = Boolean(dailySchedule.morning);
        const afternoon = Boolean(dailySchedule.afternoon);

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

    static isSlotAvailable(
        resolved: ResolvedMechanicDayAvailability,
        slot: BookingSlot
    ): boolean {
        if (!resolved.isAvailable) {
            return false;
        }

        if (slot === "morning") {
            return resolved.morning;
        }
        if (slot === "afternoon") {
            return resolved.afternoon;
        }
        return resolved.fullDay;
    }
}

