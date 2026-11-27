import { MechanicCategory } from "../../domain/User/entities/MechanicCategory.js";
import { MechanicSchedule } from "../../domain/User/entities/MechanicSchedule.js";
import { User } from "../../domain/User/entities/User.js";
import { BookingSlot } from "../../domain/User/Types/BookingTypes.js";
import { Vehicle } from "../../domain/vehilce/Vehilce.js";
import { getIndiaDayKey } from "../../shared/utils/timezone.js";
import { IFileStorageService } from "../contracts/IFileStorageService.js";
import {
    BookingCustomerSummaryDto,
    BookingScheduleTimingsDto,
    BookingServiceCategoryDto,
    BookingVehicleSummaryDto,
} from "../dtos/booking/ScheduledBookingDtos.js";
import { MechanicAvailabilityResolver } from "./MechanicAvailabilityResolver.js";

function normalizeText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeSlug(value: string): string {
    return value.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

export class BookingEnrichmentHelper {
    /**
     * Builds a short human-readable booking reference while retaining full IDs.
     */
    static formatBookingReference(bookingId: string): string {
        return `BK-${bookingId.slice(-6).toUpperCase()}`;
    }

    /**
     * Resolves display category and subcategory labels for a booking serviceType.
     */
    static resolveServiceCategory(
        serviceType: string,
        categories: MechanicCategory[]
    ): BookingServiceCategoryDto | undefined {
        const targetText = normalizeText(serviceType);
        const targetSlug = normalizeSlug(serviceType);
        if (!targetText || categories.length === 0) {
            return undefined;
        }

        for (const category of categories) {
            for (const sub of category.subcategories) {
                if (
                    normalizeText(sub.name) === targetText ||
                    normalizeSlug(sub.slug) === targetSlug
                ) {
                    return {
                        ...(category.id !== undefined ? { categoryId: category.id } : {}),
                        categoryName: category.name,
                        subcategoryName: sub.name,
                    };
                }
            }

            if (
                normalizeText(category.name) === targetText ||
                normalizeSlug(category.slug) === targetSlug
            ) {
                return {
                    ...(category.id !== undefined ? { categoryId: category.id } : {}),
                    categoryName: category.name,
                };
            }
        }

        return undefined;
    }

    /**
     * Resolves effective India-timezone shift timings for the booking's scheduled date and slot.
     */
    static resolveScheduleTimings(
        schedule: MechanicSchedule | null | undefined,
        scheduledDate: Date,
        slot: BookingSlot
    ): BookingScheduleTimingsDto | undefined {
        if (!schedule) {
            return undefined;
        }

        const resolved = MechanicAvailabilityResolver.resolveForDate(
            schedule,
            scheduledDate
        );

        const activeSlotStartTime =
            slot === "afternoon"
                ? resolved.afternoonStartTime
                : resolved.morningStartTime;

        const activeSlotEndTime =
            slot === "morning"
                ? resolved.morningEndTime
                : resolved.afternoonEndTime;

        return {
            dateKey: getIndiaDayKey(scheduledDate),
            slot,
            morningStartTime: resolved.morningStartTime,
            morningEndTime: resolved.morningEndTime,
            afternoonStartTime: resolved.afternoonStartTime,
            afternoonEndTime: resolved.afternoonEndTime,
            activeSlotStartTime,
            activeSlotEndTime,
        };
    }

    /**
     * Projects safe customer contact fields (excluding credentials/tokens).
     */
    static buildCustomerSummary(user: User): BookingCustomerSummaryDto {
        return {
            userId: user.userId!,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
        };
    }

    /**
     * Projects vehicle details with an optionally signed vehicle image URL.
     */
    static async buildVehicleSummary(
        vehicle: Vehicle,
        fileStorageService?: IFileStorageService
    ): Promise<BookingVehicleSummaryDto> {
        let resolvedImage = vehicle.vehicleImage;
        if (
            resolvedImage &&
            fileStorageService &&
            !/^https?:\/\//i.test(resolvedImage)
        ) {
            try {
                resolvedImage = await fileStorageService.getUrl(resolvedImage);
            } catch {
                // Keep raw key fallback if URL signing is unavailable.
            }
        }

        return {
            vehicleId: vehicle.id!,
            brand: vehicle.brand,
            model: vehicle.model,
            registrationNumber: vehicle.registrationNumber,
            vehicleType: vehicle.vehicleType,
            year: vehicle.year,
            fuelType: vehicle.fuelType,
            color: vehicle.color,
            ...(resolvedImage !== undefined ? { vehicleImage: resolvedImage } : {}),
        };
    }
}

