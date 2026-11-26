
import { CreateMechanicScheduleDto } from "../dtos/createMechanicScheduleDto.js";

import { DayOfWeek } from "../../domain/User/entities/MechanicSchedule.js";

export class MechanicScheduleValidator {

    private static readonly validDays: DayOfWeek[] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
    ];

    static validate(dto: CreateMechanicScheduleDto): void {

        this.validateDays(dto.weeklyAvailability);

        this.validateWorkingShifts(dto);

        this.validateTimeFormat(dto);

        this.validateShiftTimings(dto);
    }

    private static validateDays(
        weeklyAvailability: CreateMechanicScheduleDto["weeklyAvailability"]
    ): void {

        if (weeklyAvailability.length !== 7) {
            throw new Error(
                "Weekly schedule must contain exactly seven days"
            );
        }

        const days = weeklyAvailability.map(item => item.day);

        const uniqueDays = new Set(days);

        if (uniqueDays.size !== 7) {
            throw new Error(
                "Duplicate days are not allowed"
            );
        }

        const hasInvalidDay = days.some(
            day => !this.validDays.includes(day)
        );

        if (hasInvalidDay) {
            throw new Error(
                "Invalid day found in weekly schedule"
            );
        }
    }

    private static validateWorkingShifts(
        dto: CreateMechanicScheduleDto
    ): void {

        const hasWorkingShift = dto.weeklyAvailability.some(
            day => day.morning || day.afternoon
        );

        if (!hasWorkingShift) {
            throw new Error(
                "At least one working shift must be enabled"
            );
        }
    }

    private static validateTimeFormat(
        dto: CreateMechanicScheduleDto
    ): void {

        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        const times = [
            dto.morningStartTime,
            dto.morningEndTime,
            dto.afternoonStartTime,
            dto.afternoonEndTime
        ];

        const invalidTime = times.some(
            time => !timeRegex.test(time)
        );

        if (invalidTime) {
            throw new Error(
                "Invalid time format. Use HH:mm"
            );
        }
    }

    private static validateShiftTimings(
        dto: CreateMechanicScheduleDto
    ): void {

        if (dto.morningStartTime >= dto.morningEndTime) {
            throw new Error(
                "Morning end time must be after morning start time"
            );
        }

        if (dto.afternoonStartTime >= dto.afternoonEndTime) {
            throw new Error(
                "Afternoon end time must be after afternoon start time"
            );
        }

        if (dto.morningEndTime > dto.afternoonStartTime) {
            throw new Error(
                "Morning and afternoon shifts must not overlap"
            );
        }
    }
}
