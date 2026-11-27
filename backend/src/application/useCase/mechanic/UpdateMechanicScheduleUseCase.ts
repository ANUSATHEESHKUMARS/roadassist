import {
    DateAvailability,
    MechanicSchedule,
} from "../../../domain/User/entities/MechanicSchedule.js";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import {
    getIndiaDayRange,
    getIndiaTodayDateKey,
    parseIndiaDateKeyToDate,
} from "../../../shared/utils/timezone.js";
import { UpdateMechanicScheduleDto } from "../../dtos/mechanic/UpdateScheduleDto.js";
import { IUpdateMechanicScheduleUseCase } from "../../interfaces/mechanic/IUpdateMechanicScheduleUseCase.js";
import { MechanicAvailabilityResolver } from "../../services/MechanicAvailabilityResolver.js";
import { MechanicScheduleValidator } from "../../validators/MechanicScheduleValidator.js";

export class UpdateMechanicScheduleUseCase
    implements IUpdateMechanicScheduleUseCase
{
    constructor(
        private readonly scheduleRepository: IMechanicScheduleRepository,
        private readonly bookingRepository?: IBookingRepository
    ) {}

    async execute(
        mechanicId: string,
        dto: UpdateMechanicScheduleDto
    ): Promise<MechanicSchedule> {
        const existingSchedule =
            await this.scheduleRepository.findByMechanicId(mechanicId);

        if (!existingSchedule) {
            throw new NotfoundError("Mechanic schedule not found");
        }

        const now = new Date();
        MechanicScheduleValidator.validateUpdate(dto, existingSchedule, now);

        const baseTimings = {
            morningStartTime:
                dto.morningStartTime ?? existingSchedule.morningStartTime,
            morningEndTime: dto.morningEndTime ?? existingSchedule.morningEndTime,
            afternoonStartTime:
                dto.afternoonStartTime ?? existingSchedule.afternoonStartTime,
            afternoonEndTime:
                dto.afternoonEndTime ?? existingSchedule.afternoonEndTime,
        };

        let normalizedDateAvailability: DateAvailability[] | undefined;
        if (dto.dateAvailability !== undefined) {
            const existingMap = new Map(
                (existingSchedule.dateAvailability ?? []).map((entry) => [
                    entry.date,
                    entry,
                ])
            );
            normalizedDateAvailability =
                MechanicScheduleValidator.validateDateAvailabilityList(
                    dto.dateAvailability,
                    baseTimings,
                    now,
                    existingMap
                );
        }

        const candidateSchedule = new MechanicSchedule(
            existingSchedule.mechanicId,
            dto.weeklyAvailability ?? existingSchedule.weeklyAvailability,
            baseTimings.morningStartTime,
            baseTimings.morningEndTime,
            baseTimings.afternoonStartTime,
            baseTimings.afternoonEndTime,
            dto.isActive !== undefined ? dto.isActive : existingSchedule.isActive,
            existingSchedule.id,
            existingSchedule.createdAt,
            now,
            normalizedDateAvailability ?? existingSchedule.dateAvailability ?? []
        );

        await this.assertNoBookingConflicts(mechanicId, candidateSchedule, now);

        const updatePayload: Partial<MechanicSchedule> = {
            ...(dto.weeklyAvailability !== undefined && {
                weeklyAvailability: dto.weeklyAvailability,
            }),
            ...(dto.morningStartTime !== undefined && {
                morningStartTime: dto.morningStartTime,
            }),
            ...(dto.morningEndTime !== undefined && {
                morningEndTime: dto.morningEndTime,
            }),
            ...(dto.afternoonStartTime !== undefined && {
                afternoonStartTime: dto.afternoonStartTime,
            }),
            ...(dto.afternoonEndTime !== undefined && {
                afternoonEndTime: dto.afternoonEndTime,
            }),
            ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            ...(normalizedDateAvailability !== undefined && {
                dateAvailability: normalizedDateAvailability,
            }),
        };

        const updatedSchedule = await this.scheduleRepository.update(
            mechanicId,
            updatePayload
        );

        if (!updatedSchedule) {
            throw new Error("Failed to update mechanic schedule");
        }

        return updatedSchedule;
    }

    async upsertDateAvailability(
        mechanicId: string,
        entry: DateAvailability
    ): Promise<MechanicSchedule> {
        const existingSchedule =
            await this.scheduleRepository.findByMechanicId(mechanicId);

        if (!existingSchedule) {
            throw new NotfoundError(
                "Create your base weekly schedule before configuring date overrides",
                "SCHEDULE_NOT_FOUND"
            );
        }

        const now = new Date();
        const cleanEntry = MechanicScheduleValidator.validateDateAvailabilityEntry(
            entry,
            {
                morningStartTime: existingSchedule.morningStartTime,
                morningEndTime: existingSchedule.morningEndTime,
                afternoonStartTime: existingSchedule.afternoonStartTime,
                afternoonEndTime: existingSchedule.afternoonEndTime,
            },
            now
        );

        const nextDateAvailability = [
            ...(existingSchedule.dateAvailability ?? []).filter(
                (item) => item.date !== cleanEntry.date
            ),
            cleanEntry,
        ].sort((a, b) => a.date.localeCompare(b.date));

        const candidateSchedule = new MechanicSchedule(
            existingSchedule.mechanicId,
            existingSchedule.weeklyAvailability,
            existingSchedule.morningStartTime,
            existingSchedule.morningEndTime,
            existingSchedule.afternoonStartTime,
            existingSchedule.afternoonEndTime,
            existingSchedule.isActive,
            existingSchedule.id,
            existingSchedule.createdAt,
            now,
            nextDateAvailability
        );

        await this.assertNoBookingConflicts(
            mechanicId,
            candidateSchedule,
            now,
            cleanEntry.date
        );

        const updatedSchedule = await this.scheduleRepository.update(mechanicId, {
            dateAvailability: nextDateAvailability,
        });

        if (!updatedSchedule) {
            throw new Error("Failed to update date availability");
        }

        return updatedSchedule;
    }

    async removeDateAvailability(
        mechanicId: string,
        dateKey: string
    ): Promise<MechanicSchedule> {
        const existingSchedule =
            await this.scheduleRepository.findByMechanicId(mechanicId);

        if (!existingSchedule) {
            throw new NotfoundError(
                "Mechanic schedule not found",
                "SCHEDULE_NOT_FOUND"
            );
        }

        const parsedDate = parseIndiaDateKeyToDate(dateKey);
        const normalizedKey = dateKey.trim();

        const existingEntries = existingSchedule.dateAvailability ?? [];
        const hasOverride = existingEntries.some(
            (item) => item.date === normalizedKey
        );

        if (!hasOverride) {
            throw new NotfoundError(
                `No date availability override found for ${normalizedKey}`,
                "DATE_OVERRIDE_NOT_FOUND"
            );
        }

        const nextDateAvailability = existingEntries.filter(
            (item) => item.date !== normalizedKey
        );

        const now = new Date();
        const candidateSchedule = new MechanicSchedule(
            existingSchedule.mechanicId,
            existingSchedule.weeklyAvailability,
            existingSchedule.morningStartTime,
            existingSchedule.morningEndTime,
            existingSchedule.afternoonStartTime,
            existingSchedule.afternoonEndTime,
            existingSchedule.isActive,
            existingSchedule.id,
            existingSchedule.createdAt,
            now,
            nextDateAvailability
        );

        await this.assertNoBookingConflicts(
            mechanicId,
            candidateSchedule,
            now,
            normalizedKey,
            parsedDate
        );

        const updatedSchedule = await this.scheduleRepository.update(mechanicId, {
            dateAvailability: nextDateAvailability,
        });

        if (!updatedSchedule) {
            throw new Error("Failed to remove date availability override");
        }

        return updatedSchedule;
    }

    private async assertNoBookingConflicts(
        mechanicId: string,
        candidateSchedule: MechanicSchedule,
        now: Date,
        targetDateKey?: string,
        targetDate?: Date
    ): Promise<void> {
        if (!this.bookingRepository) {
            return;
        }

        const todayKey = getIndiaTodayDateKey(now);
        const range = targetDateKey
            ? getIndiaDayRange(targetDate ?? parseIndiaDateKeyToDate(targetDateKey))
            : {
                  startOfDay: parseIndiaDateKeyToDate(todayKey),
                  endOfDay: undefined,
              };

        const activeBookings =
            await this.bookingRepository.findActiveScheduledBookingsByMechanic(
                mechanicId,
                range.startOfDay,
                range.endOfDay
            );

        for (const booking of activeBookings) {
            const resolved = MechanicAvailabilityResolver.resolveForDate(
                candidateSchedule,
                booking.scheduledDate
            );

            if (resolved.dateKey < todayKey) {
                continue;
            }

            if (targetDateKey && resolved.dateKey !== targetDateKey) {
                continue;
            }

            if (
                !MechanicAvailabilityResolver.isSlotAvailable(
                    resolved,
                    booking.slot
                )
            ) {
                const slotLabel = booking.slot.replace("_", " ");
                throw new ConflictError(
                    `Cannot update schedule for ${resolved.dateKey} because an active ${slotLabel} booking (${booking.status}) already exists for that slot.`,
                    "SCHEDULE_CONFLICT_WITH_BOOKING"
                );
            }
        }
    }
}
