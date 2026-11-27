import { BookingSlot } from "../../domain/User/Types/BookingTypes.js";
import { BadRequest } from "../../shared/errors/BadRequestError.js";
import {
    compareIndiaDateWithToday,
    parseIndiaDateKeyToDate,
} from "../../shared/utils/timezone.js";

const VALID_SLOTS: BookingSlot[] = ["morning", "afternoon", "full_day"];

export class BookingValidator {
    static parseAndValidateDate(dateInput: string | Date): Date {
        let parsed: Date;
        if (
            typeof dateInput === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())
        ) {
            parsed = parseIndiaDateKeyToDate(dateInput.trim());
        } else {
            parsed =
                dateInput instanceof Date ? dateInput : new Date(dateInput);
        }

        if (Number.isNaN(parsed.getTime())) {
            throw new BadRequest("Invalid booking date", "INVALID_BOOKING_DATE");
        }
        if (compareIndiaDateWithToday(parsed) < 0) {
            throw new BadRequest(
                "Booking date cannot be in the past",
                "PAST_BOOKING_DATE"
            );
        }
        return parsed;
    }

    static validateSlot(slot: string): BookingSlot {
        if (!VALID_SLOTS.includes(slot as BookingSlot)) {
            throw new BadRequest("Invalid booking slot", "INVALID_BOOKING_SLOT");
        }
        return slot as BookingSlot;
    }

    static validateCoordinates(latitude: unknown, longitude: unknown): {
        latitude: number;
        longitude: number;
    } {
        const lat = Number(latitude);
        const lon = Number(longitude);

        if (
            latitude === undefined ||
            longitude === undefined ||
            latitude === null ||
            longitude === null ||
            Number.isNaN(lat) ||
            Number.isNaN(lon) ||
            lat < -90 ||
            lat > 90 ||
            lon < -180 ||
            lon > 180
        ) {
            throw new BadRequest(
                "Valid latitude and longitude are required",
                "INVALID_COORDINATES"
            );
        }

        return { latitude: lat, longitude: lon };
    }

    static validateNonEmptyString(value: unknown, fieldName: string): string {
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new BadRequest(
                `${fieldName} is required`,
                "MISSING_REQUIRED_FIELD"
            );
        }
        return value.trim();
    }
}

